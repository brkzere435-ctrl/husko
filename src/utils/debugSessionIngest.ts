import AsyncStorage from '@react-native-async-storage/async-storage';

/** Aligné sur `EXPO_PUBLIC_DEBUG_SESSION_ID` (EAS / `.env`) ; défaut si absent. */
const DEBUG_SESSION_ID =
  (process.env.EXPO_PUBLIC_DEBUG_SESSION_ID || 'a47b9d').trim() || 'a47b9d';
const DEFAULT_INGEST =
  'http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42';
const RING_KEY = `husko_debug_ndjson_ring_${DEBUG_SESSION_ID.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
const RING_MAX = 40;

export type DebugSessionLogPayload = {
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
  runId?: string;
};

async function appendNdjsonRing(line: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(RING_KEY);
    const arr: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    arr.push(line);
    while (arr.length > RING_MAX) arr.shift();
    await AsyncStorage.setItem(RING_KEY, JSON.stringify(arr));
  } catch {
    /* ignore */
  }
}

/** Dernières lignes NDJSON (debug session), pour copie support hors réseau / hors ingest PC. */
export async function getDebugSessionNdjsonDump(): Promise<string> {
  try {
    const raw = await AsyncStorage.getItem(RING_KEY);
    if (!raw) return '';
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr.join('\n') : '';
  } catch {
    return '';
  }
}

/**
 * Envoie une ligne NDJSON vers l’ingest local (ou `EXPO_PUBLIC_DEBUG_INGEST_URL` complète).
 * Sur APK, cleartext peut être bloqué sans `usesCleartextTraffic` / `EXPO_PUBLIC_DEBUG_ALLOW_HTTP` au build.
 * Avec `EXPO_PUBLIC_DEBUG_INGEST_DIAG=1`, duplique le JSON sur `console` → `adb logcat`.
 * Toujours : append tampon AsyncStorage (Réglages → diagnostic → rapport JSON).
 */
export function postDebugSessionLog(payload: DebugSessionLogPayload): void {
  const url = (process.env.EXPO_PUBLIC_DEBUG_INGEST_URL || '').trim() || DEFAULT_INGEST;
  const body = {
    sessionId: DEBUG_SESSION_ID,
    ...payload,
    timestamp: Date.now(),
  };
  const line = JSON.stringify(body);
  void appendNdjsonRing(line);
  if (process.env.EXPO_PUBLIC_DEBUG_INGEST_DIAG === '1') {
    console.log(`[HUSKO_NDJSON] ${line}`);
  }
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': DEBUG_SESSION_ID,
    },
    body: line,
  }).catch(() => {});
}
