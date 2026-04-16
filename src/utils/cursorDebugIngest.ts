/**
 * Ingest NDJSON Cursor (workspace `debug-<sessionId>.log`).
 * Sur téléphone physique : définir `EXPO_PUBLIC_DEBUG_INGEST_URL` avec l’IPv4 LAN du PC (port affiché par Cursor, souvent 7887).
 */

const INGEST_PATH = '/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42';
const DEFAULT_DEV_URL = `http://127.0.0.1:7887${INGEST_PATH}`;

const ENV_URL = process.env.EXPO_PUBLIC_DEBUG_INGEST_URL?.trim() ?? '';

let warnedMissingIngestUrl = false;

/** Fichier NDJSON attendu côté agent : `debug-<sessionId>.log`. Défaut = session Cursor courante. */
export function getCursorDebugSessionId(): string {
  return process.env.EXPO_PUBLIC_DEBUG_SESSION_ID?.trim() || 'eaf67a';
}

/** URL complète d’ingest : env LAN, sinon localhost uniquement en __DEV__. */
export function getCursorDebugIngestUrl(): string | null {
  if (ENV_URL.length > 0) return ENV_URL;
  if (__DEV__) return DEFAULT_DEV_URL;
  return null;
}

export type CursorDebugIngestPayload = {
  runId: string;
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
};

function shouldMirrorConsole(): boolean {
  return (
    __DEV__ ||
    process.env.EXPO_PUBLIC_DEBUG_SESSION_MIRROR === '1' ||
    process.env.EXPO_PUBLIC_HUSKO_DEBUG_BOOT === '1'
  );
}

/**
 * POST vers l’ingest Cursor + ligne `[DEBUG_NDJSON_<session>]` pour Logcat si miroir activé.
 */
export function postCursorDebugIngest(
  payload: CursorDebugIngestPayload,
  options?: { mirrorConsole?: boolean }
): void {
  const url = getCursorDebugIngestUrl();
  const sessionId = getCursorDebugSessionId();
  const body = {
    sessionId,
    runId: payload.runId,
    hypothesisId: payload.hypothesisId,
    location: payload.location,
    message: payload.message,
    data: payload.data ?? {},
    timestamp: Date.now(),
  };
  const mirror = options?.mirrorConsole ?? shouldMirrorConsole();
  if (mirror) {
    console.log(`[DEBUG_NDJSON_${sessionId}]`, JSON.stringify(body));
  }
  if (!url) {
    if (!__DEV__ && !warnedMissingIngestUrl) {
      warnedMissingIngestUrl = true;
      console.warn(
        '[cursorDebugIngest] Aucune URL ingest en build release — EXPO_PUBLIC_DEBUG_INGEST_URL doit être défini au build EAS (secrets) pour remplir debug-eaf67a.log. En dev : Metro + .env ou `npm run debug:ingest:reverse` + 127.0.0.1.'
      );
    }
    return;
  }
  const diag = __DEV__ || process.env.EXPO_PUBLIC_DEBUG_INGEST_DIAG === '1';
  void fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': sessionId,
    },
    body: JSON.stringify(body),
  })
    .then((res) => {
      if (diag) {
        console.warn('[cursorDebugIngest] POST réponse HTTP', {
          url,
          status: res.status,
          ok: res.ok,
        });
      }
    })
    .catch((err: unknown) => {
      if (diag) {
        console.warn(
          '[cursorDebugIngest] POST échoué (ingest PC joignable ? firewall / mauvais port / pas adb reverse)',
          { url, err: String(err) }
        );
      }
    });
}
