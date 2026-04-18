/**
 * Géolocalisation livreur (natif uniquement) via `react-native-geolocation-service` :
 * Fused Location sur Android, Core Location sur iOS — plus stable que `watchPositionAsync` Expo pour du suivi continu.
 *
 * Logs : préfixe `[HuskoGeo]`, jamais de coordonnées complètes (arrondi + __DEV__ / EXPO_PUBLIC_HUSKO_DEBUG_BOOT).
 * Rebuild natif (EAS / prebuild) obligatoire après ajout de la dépendance.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

const TAG = '[HuskoGeo]';

const AGENT_DEBUG_TAIL_KEY = '__husko_agent_debug_tail_a47b9d';
const AGENT_TAIL_MAX = 12;

function pushDebugTail(payload: Record<string, unknown>): void {
  void (async () => {
    try {
      const raw = await AsyncStorage.getItem(AGENT_DEBUG_TAIL_KEY);
      const arr: Record<string, unknown>[] = raw ? JSON.parse(raw) : [];
      arr.push(payload);
      while (arr.length > AGENT_TAIL_MAX) arr.shift();
      await AsyncStorage.setItem(AGENT_DEBUG_TAIL_KEY, JSON.stringify(arr));
    } catch {
      // ignore
    }
  })();
}

/** À appeler après repro (ex. 3 s sur l’écran livreur) : rejoue le tampon en logcat par morceaux (preuve sans fichier NDJSON). */
export function dumpAgentDebugTailToConsole(): void {
  void (async () => {
    try {
      const raw = await AsyncStorage.getItem(AGENT_DEBUG_TAIL_KEY);
      if (!raw) return;
      const s = raw;
      const chunk = 3500;
      for (let i = 0; i < s.length; i += chunk) {
        console.warn(`[agent-debug-tail ${Math.floor(i / chunk)}]`, s.slice(i, i + chunk));
      }
    } catch {
      // ignore
    }
  })();
}

const DEBUG_INGEST_FALLBACK =
  'http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42';

/**
 * POST NDJSON vers l’ingest Cursor : sur appareil, préférer `EXPO_PUBLIC_DEBUG_INGEST_URL` (IP LAN du PC)
 * ou `npm run debug:ingest:reverse` + même URL en 127.0.0.1. Sinon `npm run debug:ingest:logcat` redirige
 * les `console.warn` vers `debug-a47b9d.log` à la racine du dépôt.
 *
 * Libellés utilisateur : `livreurGeoErrorUserHint` (codes `PositionError` de react-native-geolocation-service).
 */
export function livreurGeoErrorUserHint(code: number): string {
  switch (code) {
    case 1:
      return 'Localisation refusée — autorisez Husko (précision) dans les paramètres.';
    case 2:
      return 'Position indisponible — activez le GPS ou la localisation système.';
    case 3:
      return 'GPS : délai dépassé — réessayez à l’air libre.';
    case 4:
      return 'Google Play Services absents ou trop anciens — mettez à jour (ou image émulateur « Google Play »).';
    case 5:
      return 'Réglages localisation insuffisants — suivez la boîte de dialogue ou activez la localisation.';
    case -1:
    default:
      return `Erreur GPS (code ${code}) — vérifiez la localisation et les services Google.`;
  }
}

export function geoThrownCode(e: unknown): number | undefined {
  if (e !== null && typeof e === 'object' && 'code' in e) {
    const c = (e as { code: unknown }).code;
    if (typeof c === 'number' && Number.isFinite(c)) return c;
  }
  return undefined;
}

export function debugAgentPost(
  location: string,
  message: string,
  hypothesisId: string,
  data?: Record<string, unknown>,
  runId: string = 'post-fix'
): void {
  const url = (process.env.EXPO_PUBLIC_DEBUG_INGEST_URL || '').trim() || DEBUG_INGEST_FALLBACK;
  const payload = {
    sessionId: 'a47b9d',
    runId,
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  };
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a47b9d' },
    body: JSON.stringify(payload),
  }).catch(() => {});
  /** Même hors `__DEV__` si session debug explicitement activée (voir `env.example`) — requis pour `npm run debug:ingest:logcat` sur APK preview. */
  const emitAgentConsole =
    __DEV__ ||
    process.env.EXPO_PUBLIC_HUSKO_DEBUG_BOOT === '1' ||
    (process.env.EXPO_PUBLIC_DEBUG_SESSION_ID || '').trim() === 'a47b9d';
  if (emitAgentConsole) {
    console.warn(`[agent-debug] ${JSON.stringify(payload)}`);
  }
  pushDebugTail(payload as Record<string, unknown>);
}

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
      // #region agent log
      debugAgentPost(
        'livreurGeolocation.ts:ensureLivreurLocationPermission',
        'ios auth result',
        'H1',
        { status, ok }
      );
      // #endregion
      return ok;
    } catch (e) {
      geoLog('ios authorization error', { err: String(e) });
      return false;
    }
  }
  const results = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);
  const fine = results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
  const coarse = results[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];
  /** Haute précision GPS : exiger ACCESS_FINE_LOCATION (approximatif seul = suivi médiocre / refus Play policy). */
  const ok = fine === PermissionsAndroid.RESULTS.GRANTED;
  geoLog('android location (requestMultiple)', { fine, coarse });
  // #region agent log
  debugAgentPost(
    'livreurGeolocation.ts:ensureLivreurLocationPermission',
    'android requestMultiple results',
    'H1',
    { fine, coarse, ok }
  );
  // #endregion
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
        // #region agent log
        debugAgentPost(
          'livreurGeolocation.ts:getCurrentPosition:error',
          'initial fix error',
          'H3',
          { code: err.code, message: err.message }
        );
        // #endregion
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
  console.log('[HuskoGeo] watchPosition — démarrage service (enableHighAccuracy: true)');
  // #region agent log
  debugAgentPost(
    'livreurGeolocation.ts:startLivreurWatch',
    'watchPosition invoked',
    'H3',
    { platform: Platform.OS }
  );
  // #endregion
  const watchId = Geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, heading } = position.coords;
      const h = typeof heading === 'number' && Number.isFinite(heading) ? heading : 0;
      geoLog('watch tick', { accuracy: position.coords.accuracy });
      onPosition(latitude, longitude, h);
    },
    (error) => {
      geoLog('watch error', { code: error.code, message: error.message });
      // #region agent log
      debugAgentPost(
        'livreurGeolocation.ts:watchPosition:error',
        'watch error callback',
        'H2',
        { code: error.code, message: error.message }
      );
      // #endregion
      onWatchError?.(error.code, error.message);
    },
    watchOptions()
  );
  return watchId;
}

export function clearLivreurWatch(watchId: number | null): void {
  if (watchId == null) return;
  try {
    Geolocation.clearWatch(watchId);
  } catch {
    /* natif sensible sur certains Samsung si aucun watch actif */
  }
  try {
    // Un seul watcher livreur dans l'app : forcer l'arrêt global évite les observers orphelins.
    Geolocation.stopObserving();
  } catch {
    /* stopObserving sans watch préalable peut throw sur une minorité d’OEM */
  }
}
