import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as authApi from '@/api/auth';
import { isAuthError, refreshAccessToken, setAuthLostHandler } from '@/api/client';
import { getMyProfile } from '@/api/profiles';
import type { Profile, ProfileResponse } from '@/api/types';
import { StorageKeys } from '@/constants/config';
import { bumpContentVersion } from '@/lib/content-version';
import { getItem, removeItem, setItem } from '@/lib/storage';
import { showToast } from '@/lib/toast';
import { decodeToken, isExpired, type TokenClaims } from '@/lib/token';

type Status = 'loading' | 'signedOut' | 'signedIn';

type Session = {
  status: Status;
  claims: TokenClaims | null;
  /** True once the account has a completed profile. */
  verified: boolean;
  /** Whether the intro carousel was already shown on a previous launch. */
  welcomeSeen: boolean;
  profile: Profile | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: (message?: string) => Promise<void>;
  markVerified: () => void;
  refreshProfile: () => Promise<ProfileResponse | null>;
  rememberWelcomeSeen: () => void;
  /** Re-reads the access token's claims (used after a refresh). */
  reloadClaims: () => Promise<TokenClaims | null>;
};

const SessionContext = createContext<Session | null>(null);

export function useSession(): Session {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [claims, setClaims] = useState<TokenClaims | null>(null);
  const [verifiedLocally, setVerifiedLocally] = useState(false);
  const [welcomeSeen, setWelcomeSeen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const clearStorage = useCallback(async () => {
    await Promise.all(
      [StorageKeys.access, StorageKeys.refresh, ...StorageKeys.legacy].map((k) => removeItem(k)),
    );
  }, []);

  const signOut = useCallback(
    async (message?: string) => {
      await clearStorage();
      setClaims(null);
      setProfile(null);
      setVerifiedLocally(false);
      setStatus('signedOut');
      bumpContentVersion();
      if (message) showToast(message, 'info');
    },
    [clearStorage],
  );

  // Let the API client sign the user out when the session can't be recovered.
  useEffect(() => {
    setAuthLostHandler((message) => {
      void signOut(message);
    });
    return () => setAuthLostHandler(null);
  }, [signOut]);

  // Boot: restore any saved session, refreshing an expired access token.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [access, refresh, seen] = await Promise.all([
        getItem(StorageKeys.access),
        getItem(StorageKeys.refresh),
        getItem(StorageKeys.welcomeSeen),
      ]);
      if (cancelled) return;
      setWelcomeSeen(seen === '1');
      if (!access && !refresh) {
        setStatus('signedOut');
        return;
      }
      let current = decodeToken(access);
      if (!current || isExpired(current)) {
        try {
          current = decodeToken(await refreshAccessToken());
        } catch (e) {
          if (isAuthError(e)) {
            await clearStorage();
            if (!cancelled) setStatus('signedOut');
            return;
          }
          // Offline: keep the session and retry on the first request.
        }
      }
      if (cancelled) return;
      setClaims(current);
      setStatus(current || refresh ? 'signedIn' : 'signedOut');
    })();
    return () => {
      cancelled = true;
    };
  }, [clearStorage]);

  const signIn = useCallback(async (username: string, password: string) => {
    const tokens = await authApi.login(username.trim(), password);
    await setItem(StorageKeys.access, tokens.access);
    await setItem(StorageKeys.refresh, tokens.refresh);
    setClaims(decodeToken(tokens.access));
    setVerifiedLocally(false);
    setStatus('signedIn');
  }, []);

  const reloadClaims = useCallback(async () => {
    const next = decodeToken(await getItem(StorageKeys.access));
    setClaims(next);
    return next;
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await getMyProfile();
      setProfile(data.profile ?? null);
      return data;
    } catch {
      return null;
    }
  }, []);

  const markVerified = useCallback(() => setVerifiedLocally(true), []);

  const rememberWelcomeSeen = useCallback(() => {
    void setItem(StorageKeys.welcomeSeen, '1');
  }, []);

  const verified = Boolean(claims?.is_verified) || verifiedLocally;

  const value = useMemo<Session>(
    () => ({ status, claims, verified, welcomeSeen, profile, signIn, signOut, markVerified, refreshProfile, rememberWelcomeSeen, reloadClaims }),
    [status, claims, verified, welcomeSeen, profile, signIn, signOut, markVerified, refreshProfile, rememberWelcomeSeen, reloadClaims],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
