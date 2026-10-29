import { jwtDecode } from 'jwt-decode';

export type TokenClaims = {
  exp?: number;
  user_id?: number | string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_verified?: boolean;
};

export function decodeToken(token: string | null | undefined): TokenClaims | null {
  if (!token) return null;
  try {
    return jwtDecode<TokenClaims>(token);
  } catch {
    return null;
  }
}

/** True when the token is missing an expiry, expired, or about to expire within `skewSeconds`. */
export function isExpired(claims: TokenClaims | null, skewSeconds = 30, nowMs = Date.now()): boolean {
  if (!claims || typeof claims.exp !== 'number') return true;
  return nowMs / 1000 >= claims.exp - skewSeconds;
}
