const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;

/** "just now", "5m", "3h", "2d", then a short date. Returns '' for unparseable input. */
export function timeAgo(iso?: string | null, nowMs = Date.now()): string {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const s = Math.max(0, Math.round((nowMs - t) / 1000));
  if (s < 45) return 'just now';
  if (s < HOUR) return `${Math.max(1, Math.round(s / MINUTE))}m`;
  if (s < DAY) return `${Math.round(s / HOUR)}h`;
  if (s < DAY * 7) return `${Math.round(s / DAY)}d`;
  return shortDate(iso);
}

export function shortDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function initials(name?: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
}

export function fullName(user?: { first_name?: string | null; last_name?: string | null; username?: string | null } | null): string {
  const name = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim();
  return name || user?.username || 'Neighbour';
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function greeting(hour = new Date().getHours()): string {
  if (hour < 5) return 'Up late';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function sameText(a?: string | null, b?: string | null): boolean {
  return !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** True when `haystack` mentions `city` (case-insensitive). Used to rank local results first. */
export function mentionsPlace(haystack?: string | null, city?: string | null): boolean {
  if (!haystack || !city) return false;
  return haystack.toLowerCase().includes(city.trim().toLowerCase());
}

/** Stable sort that moves items in the active place to the front. */
export function localFirst<T>(items: T[], getLocation: (item: T) => string | null | undefined, city?: string | null): T[] {
  if (!city) return items;
  const local: T[] = [];
  const rest: T[] = [];
  for (const item of items) (mentionsPlace(getLocation(item), city) ? local : rest).push(item);
  return [...local, ...rest];
}
