import { MEDIA_BASE_URL } from '@/constants/config';

/** Backend media may be absolute URLs or paths relative to the media host. */
export function mediaUrl(u?: string | null): string | null {
  if (!u) return null;
  return /^https?:\/\//i.test(u) ? u : MEDIA_BASE_URL + u.replace(/^\//, '');
}
