import * as Location from 'expo-location';

import type { LatLng } from '@/stores/useHuskoStore';

const cache = new Map<string, LatLng>();
const MIN_ADDRESS_QUERY_LENGTH = 4;
const MAX_CACHE_ENTRIES = 80;

function normalizeAddress(address: string): string {
  return address.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Géocode une adresse texte en coordonnées GPS.
 * Renvoie null si aucun résultat n'est trouvé.
 */
export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const key = normalizeAddress(address);
  if (key.length < MIN_ADDRESS_QUERY_LENGTH) return null;
  const cached = cache.get(key);
  if (cached) return cached;
  try {
    const hits = await Location.geocodeAsync(address);
    const first = hits[0];
    if (!first) return null;
    const lat = first.latitude;
    const lng = first.longitude;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const result: LatLng = { latitude: lat, longitude: lng };
    if (cache.size >= MAX_CACHE_ENTRIES) {
      const oldest = cache.keys().next().value;
      if (typeof oldest === 'string') cache.delete(oldest);
    }
    cache.set(key, result);
    return result;
  } catch {
    return null;
  }
}
