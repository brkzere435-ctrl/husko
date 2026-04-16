import type { MapRegion } from '@/types/mapRegion';

const DEFAULT_MAP_REGION: MapRegion = {
  latitude: 47.4739,
  longitude: -0.5517,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

const MIN_DELTA = 0.004;
const MAX_DELTA = 1.2;

/** Évite MapView noir / comportements indéfinis si la région contient NaN ou est absente. */
export function sanitizeMapRegion(r: MapRegion | null | undefined): MapRegion {
  if (!r) return { ...DEFAULT_MAP_REGION };
  const { latitude, longitude, latitudeDelta, longitudeDelta } = r;
  if (
    ![latitude, longitude, latitudeDelta, longitudeDelta].every(
      (n) => typeof n === 'number' && Number.isFinite(n)
    )
  ) {
    return { ...DEFAULT_MAP_REGION };
  }
  const lat = Math.min(85, Math.max(-85, latitude));
  const lng = Math.min(180, Math.max(-180, longitude));
  const latD = Math.min(MAX_DELTA, Math.max(MIN_DELTA, latitudeDelta));
  const lngD = Math.min(MAX_DELTA, Math.max(MIN_DELTA, longitudeDelta));
  return { latitude: lat, longitude: lng, latitudeDelta: latD, longitudeDelta: lngD };
}

type Pt = { latitude: number; longitude: number };

/** Cadre tous les points avec une marge (mini-cartes, suivi). */
export function fitMapRegion(points: Pt[], padding = 1.7): MapRegion {
  if (points.length === 0) {
    return { ...DEFAULT_MAP_REGION };
  }
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  for (const p of points) {
    minLat = Math.min(minLat, p.latitude);
    maxLat = Math.max(maxLat, p.latitude);
    minLng = Math.min(minLng, p.longitude);
    maxLng = Math.max(maxLng, p.longitude);
  }
  const midLat = (minLat + maxLat) / 2;
  const midLng = (minLng + maxLng) / 2;
  const rawLat = Math.max(1e-8, maxLat - minLat);
  const rawLng = Math.max(1e-8, maxLng - minLng);
  const latitudeDelta = Math.min(0.42, Math.max(0.016, rawLat * padding));
  const longitudeDelta = Math.min(0.42, Math.max(0.016, rawLng * padding));
  return { latitude: midLat, longitude: midLng, latitudeDelta, longitudeDelta };
}
