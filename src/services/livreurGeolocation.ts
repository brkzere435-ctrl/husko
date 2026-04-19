/**
 * GPS livreur — reset complet :
 * - Une seule implémentation `expo-location` (Android + iOS)
 * - Premier fix rapide (cache), puis fix précis, puis watch live
 * - API stable pour l’écran livreur
 */
import * as Location from 'expo-location';

const TAG = '[HuskoGeo]';

type PositionCb = (lat: number, lng: number, headingDeg: number) => void;
type WatchHandle = { sub?: Location.LocationSubscription; cancelled?: boolean };

const watchHandles = new Map<number, WatchHandle>();
let nextWatchId = 1;

/** Paramètres cibles du suivi livreur (référence historique Fused). */
const LIVREUR_FUSED_PROFILE = {
  distanceFilter: 10,
  interval: 5000,
  fastestInterval: 2000,
} as const;

function shouldLog(): boolean {
  return __DEV__ || process.env.EXPO_PUBLIC_HUSKO_DEBUG_BOOT === '1';
}

function geoLog(message: string, data?: Record<string, unknown>): void {
  if (!shouldLog()) return;
  if (data) {
    console.log(TAG, message, data);
  } else {
    console.log(TAG, message);
  }
}

/** Compat API: instrumentation retirée dans la version stable. */
export function debugAgentPost(..._args: unknown[]): void {}
/** Compat API: instrumentation retirée dans la version stable. */
export function dumpAgentDebugTailToConsole(): void {}

export function geoThrownCode(e: unknown): number | undefined {
  if (e !== null && typeof e === 'object' && 'code' in e) {
    const c = (e as { code: unknown }).code;
    if (typeof c === 'number' && Number.isFinite(c)) return c;
  }
  return undefined;
}

export function livreurGeoErrorUserHint(code: number): string {
  switch (code) {
    case 1:
      return 'Localisation refusée — autorisez Husko dans les paramètres.';
    case 2:
      return 'Position indisponible — activez le GPS puis réessayez.';
    case 3:
      return 'GPS trop lent — sortez à découvert puis relancez le suivi.';
    default:
      return 'GPS indisponible — vérifiez localisation et réseau.';
  }
}

export async function ensureLivreurLocationPermission(): Promise<boolean> {
  try {
    const fg = await Location.requestForegroundPermissionsAsync();
    const ok = fg.status === Location.PermissionStatus.GRANTED;
    geoLog('permission foreground', { status: fg.status, ok });
    if (!ok) return false;

    // Best effort Android : utile pour tenir le suivi quand l’app passe en arrière-plan.
    try {
      const bg = await Location.requestBackgroundPermissionsAsync();
      geoLog('permission background', { status: bg.status });
    } catch (e) {
      geoLog('permission background error', { err: String(e) });
    }
    return true;
  } catch (e) {
    geoLog('permission error', { err: String(e) });
    return false;
  }
}

export async function getInitialLivreurPosition(): Promise<{
  lat: number;
  lng: number;
  headingDeg: number;
}> {
  try {
    const cached = await Location.getLastKnownPositionAsync({
      requiredAccuracy: 180,
      maxAge: 180_000,
    });
    if (cached?.coords?.latitude != null && cached?.coords?.longitude != null) {
      const h =
        typeof cached.coords.heading === 'number' && Number.isFinite(cached.coords.heading)
          ? cached.coords.heading
          : 0;
      return { lat: cached.coords.latitude, lng: cached.coords.longitude, headingDeg: h };
    }
  } catch {
    // ignore cache miss
  }

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.BestForNavigation,
    mayShowUserSettingsDialog: true,
  });
  const h = typeof pos.coords.heading === 'number' && Number.isFinite(pos.coords.heading) ? pos.coords.heading : 0;
  return { lat: pos.coords.latitude, lng: pos.coords.longitude, headingDeg: h };
}

export function startLivreurWatch(
  onPosition: PositionCb,
  onWatchError?: (code: number, message: string) => void
): number {
  const watchId = nextWatchId++;
  const handle: WatchHandle = {};
  watchHandles.set(watchId, handle);

  void Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: LIVREUR_FUSED_PROFILE.distanceFilter,
      timeInterval: LIVREUR_FUSED_PROFILE.interval,
      mayShowUserSettingsDialog: true,
    },
    (position) => {
      const heading =
        typeof position.coords.heading === 'number' && Number.isFinite(position.coords.heading)
          ? position.coords.heading
          : 0;
      onPosition(position.coords.latitude, position.coords.longitude, heading);
    }
  )
    .then((sub) => {
      const current = watchHandles.get(watchId);
      if (!current) {
        sub.remove();
        return;
      }
      if (current.cancelled) {
        sub.remove();
        watchHandles.delete(watchId);
        return;
      }
      current.sub = sub;
    })
    .catch((e) => {
      geoLog('watch start error', { err: String(e) });
      watchHandles.delete(watchId);
      onWatchError?.(-1, String(e));
    });

  return watchId;
}

export function clearLivreurWatch(watchId: number | null): void {
  if (watchId == null) return;
  const handle = watchHandles.get(watchId);
  if (!handle) return;
  if (handle.sub) {
    try {
      handle.sub.remove();
    } catch {
      // ignore
    }
  } else {
    handle.cancelled = true;
  }
  watchHandles.delete(watchId);
}
