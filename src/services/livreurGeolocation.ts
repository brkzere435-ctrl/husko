/**
 * Géolocalisation livreur (natif uniquement) via `react-native-geolocation-service` :
 * Fused Location sur Android, Core Location sur iOS — plus stable que `watchPositionAsync` Expo pour du suivi continu.
 *
 * Logs : préfixe `[HuskoGeo]`, jamais de coordonnées complètes (arrondi + __DEV__ / EXPO_PUBLIC_HUSKO_DEBUG_BOOT).
 * Rebuild natif (EAS / prebuild) obligatoire après ajout de la dépendance.
 */
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

const TAG = '[HuskoGeo]';

function shouldLog(): boolean {
  return __DEV__ || process.env.EXPO_PUBLIC_HUSKO_DEBUG_BOOT === '1';
}

function geoLog(message: string, data?: Record<string, unknown>): void {
  if (!shouldLog()) return;
  if (data) {
    const copy = { ...data };
    if (typeof copy.lat === 'number') copy.lat = Math.round((copy.lat as number) * 1e4) / 1e4;
    if (typeof copy.lng === 'number') copy.lng = Math.round((copy.lng as number) * 1e4) / 1e4;
    console.log(TAG, message, copy);
  } else {
    console.log(TAG, message);
  }
}

export async function ensureLivreurLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    try {
      const status = await Geolocation.requestAuthorization('whenInUse');
      const ok = status === 'granted';
      geoLog('ios authorization', { status });
      return ok;
    } catch (e) {
      geoLog('ios authorization error', { err: String(e) });
      return false;
    }
  }
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );
  const ok = granted === PermissionsAndroid.RESULTS.GRANTED;
  geoLog('android fine location', { granted });
  return ok;
}

type PositionCb = (lat: number, lng: number, headingDeg: number) => void;

/** Android : interval / fused. iOS : pas de `interval` natif identique — filtre distance + haute précision. */
function watchOptions(): Record<string, unknown> {
  if (Platform.OS === 'android') {
    return {
      enableHighAccuracy: true,
      distanceFilter: 10,
      interval: 5000,
      fastestInterval: 2000,
      showLocationDialog: true,
      forceRequestLocation: true,
    };
  }
  return {
    enableHighAccuracy: true,
    distanceFilter: 10,
  };
}

export function getInitialLivreurPosition(): Promise<{
  lat: number;
  lng: number;
  headingDeg: number;
}> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, heading } = pos.coords;
        const h = typeof heading === 'number' && Number.isFinite(heading) ? heading : 0;
        geoLog('initial fix', { accuracy: pos.coords.accuracy });
        resolve({ lat: latitude, lng: longitude, headingDeg: h });
      },
      (err) => {
        geoLog('initial fix error', { code: err.code, message: err.message });
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000,
      }
    );
  });
}

export function startLivreurWatch(
  onPosition: PositionCb,
  onWatchError?: (code: number, message: string) => void
): number {
  const watchId = Geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, heading } = position.coords;
      const h = typeof heading === 'number' && Number.isFinite(heading) ? heading : 0;
      geoLog('watch tick', { accuracy: position.coords.accuracy });
      onPosition(latitude, longitude, h);
    },
    (error) => {
      geoLog('watch error', { code: error.code, message: error.message });
      onWatchError?.(error.code, error.message);
    },
    watchOptions()
  );
  return watchId;
}

export function clearLivreurWatch(watchId: number | null): void {
  if (watchId == null) return;
  Geolocation.clearWatch(watchId);
}
