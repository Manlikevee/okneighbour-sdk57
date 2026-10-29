import axios, { isAxiosError, type InternalAxiosRequestConfig } from 'axios';

import { API_URL, StorageKeys } from '@/constants/config';
import { getItem, setItem } from '@/lib/storage';
import { decodeToken, isExpired } from '@/lib/token';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Skip attaching the bearer token (login, register, refresh). */
    skipAuth?: boolean;
  }
}

export class AuthError extends Error {
  isAuthError = true;
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthError';
  }
}

export function isAuthError(e: unknown): e is AuthError {
  return !!e && typeof e === 'object' && (e as { isAuthError?: boolean }).isAuthError === true;
}

let onAuthLost: ((message: string) => void) | null = null;
/** The session provider registers this so a dead session signs the user out. */
export function setAuthLostHandler(fn: ((message: string) => void) | null) {
  onAuthLost = fn;
}

export const api = axios.create({ baseURL: API_URL, timeout: 60000 });

let refreshing: Promise<string> | null = null;

/** Refreshes the access token. Concurrent callers share one request (rotating refresh tokens would otherwise race). */
export function refreshAccessToken(): Promise<string> {
  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

async function doRefresh(): Promise<string> {
  const refresh = await getItem(StorageKeys.refresh);
  if (!refresh) throw new AuthError('No refresh token');
  try {
    const res = await axios.post<{ access: string; refresh?: string }>(
      `${API_URL}auth/api/token/refresh/`,
      { refresh },
      { timeout: 30000 },
    );
    await setItem(StorageKeys.access, res.data.access);
    // Only replace the refresh token if the backend rotated it (the previous app crashed otherwise).
    if (res.data.refresh) await setItem(StorageKeys.refresh, res.data.refresh);
    return res.data.access;
  } catch (e) {
    const status = isAxiosError(e) ? e.response?.status : undefined;
    if (status === 400 || status === 401 || status === 403) throw new AuthError('Session expired');
    throw e; // network / server error: do not sign the user out
  }
}

api.interceptors.request.use(async (config) => {
  if (config.skipAuth) return config;
  let access = await getItem(StorageKeys.access);
  if (!access) {
    onAuthLost?.('Please log in to continue.');
    throw new AuthError('No access token');
  }
  if (isExpired(decodeToken(access))) {
    try {
      access = await refreshAccessToken();
    } catch (e) {
      if (isAuthError(e)) onAuthLost?.('Your session expired. Please log in again.');
      throw e;
    }
  }
  config.headers.set('Authorization', `Bearer ${access}`);
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401 && error.config && !error.config.skipAuth) {
      const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };
      if (!original._retried) {
        original._retried = true;
        try {
          const token = await refreshAccessToken();
          original.headers.set('Authorization', `Bearer ${token}`);
          return api(original);
        } catch (e) {
          if (isAuthError(e)) onAuthLost?.('Your session expired. Please log in again.');
          throw e;
        }
      }
    }
    throw error;
  },
);

function firstFieldError(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  for (const value of Object.values(data as Record<string, unknown>)) {
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  }
  return null;
}

/** Turns any thrown value into a message that is safe to show to people. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return error.code === 'ECONNABORTED'
        ? 'The server is taking too long to respond. Please try again.'
        : 'Can’t reach OkNeighbour. Check your connection and try again.';
    }
    const data: unknown = error.response.data;
    if (typeof data === 'string') return data.length > 0 && data.length < 160 && !data.includes('<') ? data : fallback;
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      for (const key of ['error', 'detail', 'message']) {
        if (typeof d[key] === 'string') return d[key] as string;
      }
      return firstFieldError(data) ?? fallback;
    }
    return fallback;
  }
  if (isAuthError(error)) return error.message;
  return fallback;
}
