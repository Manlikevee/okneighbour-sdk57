/** Central app configuration. Values that may differ per environment read from EXPO_PUBLIC_* vars. */

/** Existing production backend (unchanged from the previous app). Must end with a slash. */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://huddle-backend-7xzt.onrender.com/';

export const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
/** Nominatim's usage policy asks clients to identify themselves (carried over from the previous app). */
export const NOMINATIM_CONTACT_EMAIL = 'odahviktor@gmail.com';
export const NOMINATIM_USER_AGENT = 'OkNeighbourApp/2.0';

/** Existing media host the backend serves videos from (relative video paths are prefixed with this). */
export const MEDIA_BASE_URL = 'https://res.cloudinary.com/viktortech/';

export const POST_MIN_LENGTH = 10;
export const POST_MAX_LENGTH = 400;
export const POST_MAX_IMAGES = 5;
/** The previous app pre-filled this when a profile website was left blank (backend expects a value). */
export const DEFAULT_BIO_URL = 'https://huddleapp.vercel.app/';
/** Cached reverse-geocode results are reused for this long (same as the previous app: 60 min). */
export const LOCATION_CACHE_MS = 60 * 60 * 1000;

export const StorageKeys = {
  access: 'access_token',
  refresh: 'refresh_token',
  place: 'ok_active_place',
  recentPlaces: 'ok_recent_places',
  welcomeSeen: 'ok_welcome_seen',
  appearance: 'ok_appearance',
  /** Keys written by the previous app; cleared on sign-out so no stale data lingers. */
  legacy: ['userdata_token', 'userLocation', 'locationTimestamp', 'location_data'],
} as const;

export const BRAND = {
  name: 'OkNeighbour',
  tagline: 'Your neighbourhood, in your pocket.',
} as const;
