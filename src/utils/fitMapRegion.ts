import type { MapRegion } from '@/types/mapRegion';

type Pt = { latitude: number; longitude: number };

/** Cadre tous les points avec une marge (mini-cartes, suivi). */
export function fitMapRegion(points: Pt[], padding = 1.7): MapRegion {
  if (points.length === 0) {
    return {
      latitude: 47.4739,
      longitude: -0.5517,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06,
    };
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
