import { api } from './client';

export type Tokens = { access: string; refresh: string };

export async function login(username: string, password: string): Promise<Tokens> {
  const res = await api.post<Tokens>('auth/api/token/', { username, password }, { skipAuth: true });
  return res.data;
}

export type RegisterInput = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  postal_code: string;
  location: string;
  address: string;
  password: string;
};

export async function register(input: RegisterInput): Promise<{ message?: string }> {
  const res = await api.post<{ message?: string }>('auth/register/', input, { skipAuth: true });
  return res.data;
}
