import { debugAgentLog } from '@/utils/debugAgentLog';

/** URL complète d’ingest (optionnel). Sans variable d’env, aucun POST réseau. */
const ENV_INGEST_URL = process.env.EXPO_PUBLIC_DEBUG_INGEST_URL?.trim() ?? '';
export const DEBUG_INGEST_URL = ENV_INGEST_URL;
export const DEBUG_INGEST_SESSION_ID =
  process.env.EXPO_PUBLIC_DEBUG_SESSION_ID?.trim() || 'husko';

type RuntimeIngestPayload = {
  runId: string;
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
};

/**
 * Ingest debug session (ex. Cursor) — uniquement si `EXPO_PUBLIC_DEBUG_INGEST_URL` pointe vers le PC (LAN).
 */
export function postSessionA64698Ingest(
  payload: Omit<RuntimeIngestPayload, 'runId'> & { runId?: string }
): void {
  const supportDebugEnabled =
    __DEV__ ||
    process.env.EXPO_PUBLIC_HUSKO_DEBUG_BOOT === '1' ||
    ENV_INGEST_URL.length > 0;
  if (!supportDebugEnabled) return;
  if (__DEV__) {
    debugAgentLog({
      location: payload.location,
      message: payload.message,
      hypothesisId: payload.hypothesisId,
      data: {
        ...payload.data,
        runId: payload.runId,
        huskoDebugSession: 'a64698',
      },
    });
  }
  if (!ENV_INGEST_URL) return;
  void fetch(ENV_INGEST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': 'a64698',
    },
    body: JSON.stringify({
      sessionId: 'a64698',
      ...payload,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}

export function postRuntimeDebugIngest(payload: RuntimeIngestPayload): void {
  if (!ENV_INGEST_URL) return;
  void fetch(ENV_INGEST_URL, {
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
  }).catch(() => {});
}
