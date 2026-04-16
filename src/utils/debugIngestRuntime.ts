import { debugAgentLog } from '@/utils/debugAgentLog';
import {
  getCursorDebugIngestUrl,
  getCursorDebugSessionId,
  postCursorDebugIngest,
  type CursorDebugIngestPayload,
} from '@/utils/cursorDebugIngest';

/** @deprecated Utiliser `postCursorDebugIngest` — conservé pour imports historiques. */
export const DEBUG_INGEST_URL = process.env.EXPO_PUBLIC_DEBUG_INGEST_URL?.trim() ?? '';
export const DEBUG_INGEST_SESSION_ID = getCursorDebugSessionId();

type RuntimeIngestPayload = CursorDebugIngestPayload;

/** @deprecated Sessions hardcodées retirées — délègue à `postCursorDebugIngest`. */
export function postSessionA64698Ingest(
  payload: Omit<RuntimeIngestPayload, 'runId'> & { runId?: string }
): void {
  const supportDebugEnabled =
    __DEV__ ||
    process.env.EXPO_PUBLIC_HUSKO_DEBUG_BOOT === '1' ||
    DEBUG_INGEST_URL.length > 0;
  if (!supportDebugEnabled) return;
  if (__DEV__) {
    debugAgentLog({
      location: payload.location,
      message: payload.message,
      hypothesisId: payload.hypothesisId,
      data: {
        ...payload.data,
        runId: payload.runId,
      },
    });
  }
  if (!getCursorDebugIngestUrl()) return;
  postCursorDebugIngest({
    ...payload,
    runId: payload.runId ?? `run-${Date.now().toString(36)}`,
  });
}

export function postRuntimeDebugIngest(payload: RuntimeIngestPayload): void {
  postCursorDebugIngest(payload);
}
