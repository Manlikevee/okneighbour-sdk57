import axios from 'axios';

import { NOMINATIM_CONTACT_EMAIL, NOMINATIM_URL, NOMINATIM_USER_AGENT } from '@/constants/config';
import { placeFromNominatim, type NominatimResult, type Place } from '@/lib/place';

const headers = { 'User-Agent': NOMINATIM_USER_AGENT, Accept: 'application/json' };

/** Same endpoint and params the previous app used. */
export async function reverseGeocode(latitude: number, longitude: number): Promise<Place | null> {
  const res = await axios.get<NominatimResult>(`${NOMINATIM_URL}/reverse`, {
    params: { format: 'json', lat: latitude, lon: longitude, addressdetails: 1, email: NOMINATIM_CONTACT_EMAIL },
    headers,
    timeout: 20000,
  });
  const place = placeFromNominatim({ ...res.data, lat: String(latitude), lon: String(longitude) }, 'device');
  return place;
}

/** Forward search for the location picker. Call on submit (not per keystroke) per Nominatim's usage policy. */
export async function searchPlaces(query: string): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const res = await axios.get<NominatimResult[]>(`${NOMINATIM_URL}/search`, {
    params: { format: 'json', q, addressdetails: 1, limit: 8, email: NOMINATIM_CONTACT_EMAIL },
    headers,
    timeout: 20000,
  });
  const seen = new Set<string>();
  const out: Place[] = [];
  for (const r of Array.isArray(res.data) ? res.data : []) {
    const p = placeFromNominatim(r, 'manual');
    if (p && !seen.has(p.city.toLowerCase())) {
      seen.add(p.city.toLowerCase());
      out.push(p);
    }
  }
  return out;
}
