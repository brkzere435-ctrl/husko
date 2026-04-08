const FALLBACK_INGEST_URL =
  'http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42';
const FALLBACK_SESSION_ID = '995197';

const ENV_INGEST_URL = process.env.EXPO_PUBLIC_DEBUG_INGEST_URL?.trim() ?? '';
export const DEBUG_INGEST_URL =
  ENV_INGEST_URL.length > 0 ? ENV_INGEST_URL : (__DEV__ ? FALLBACK_INGEST_URL : '');
export const DEBUG_INGEST_SESSION_ID =
  process.env.EXPO_PUBLIC_DEBUG_SESSION_ID?.trim() || FALLBACK_SESSION_ID;

type RuntimeIngestPayload = {
  runId: string;
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
};

export function postRuntimeDebugIngest(payload: RuntimeIngestPayload): void {
  if (!DEBUG_INGEST_URL) return;
  // #region agent log
  if (__DEV__) console.log('[HuskoIngest] send', DEBUG_INGEST_URL, payload.location);
  // #endregion
  void fetch(DEBUG_INGEST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': DEBUG_INGEST_SESSION_ID,
    },
    body: JSON.stringify({
      sessionId: DEBUG_INGEST_SESSION_ID,
      ...payload,
      timestamp: Date.now(),
    }),
  }).catch((err: unknown) => {
    // #region agent log
    if (__DEV__) {
      console.log(
        '[HuskoIngest] fail',
        DEBUG_INGEST_URL,
        payload.location,
        err instanceof Error ? err.message : String(err)
      );
    }
    // #endregion
  });
}
