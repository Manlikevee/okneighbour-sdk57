export type Place = {
  /** Name the backend filters on (derived exactly as the previous app did). */
  city: string;
  region?: string;
  country?: string;
  displayName: string;
  postCode?: string;
  latitude?: number;
  longitude?: number;
  source: 'device' | 'manual';
  /** Epoch ms of when this place was resolved. */
  resolvedAt: number;
};

export type NominatimAddress = {
  town?: string;
  village?: string;
  county?: string;
  city?: string;
  state?: string;
  region?: string;
  country?: string;
  postcode?: string;
};

/**
 * Same precedence the previous app used (town > village > county > city). Existing posts and
 * profiles store these strings, so changing the order would hide existing local content.
 */
export function deriveCity(address?: NominatimAddress | null): string {
  return address?.town || address?.village || address?.county || address?.city || 'Unknown';
}

export type NominatimResult = {
  lat?: string;
  lon?: string;
  display_name?: string;
  address?: NominatimAddress;
};

export function placeFromNominatim(r: NominatimResult, source: Place['source'], now = Date.now()): Place | null {
  const city = deriveCity(r.address);
  if (city === 'Unknown') return null;
  const lat = r.lat ? Number(r.lat) : undefined;
  const lon = r.lon ? Number(r.lon) : undefined;
  return {
    city,
    region: r.address?.state || r.address?.region,
    country: r.address?.country,
    displayName: r.display_name || city,
    postCode: r.address?.postcode,
    latitude: Number.isFinite(lat) ? lat : undefined,
    longitude: Number.isFinite(lon) ? lon : undefined,
    source,
    resolvedAt: now,
  };
}

/** "Luton, England" style subtitle. */
export function placeSubtitle(p: Place): string {
  return [p.region, p.country].filter(Boolean).join(', ');
}
