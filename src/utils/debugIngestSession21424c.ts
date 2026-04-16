/**
 * Ingest NDJSON session debug Cursor (`debug-21424c.log`).
 * URL : même logique que `cursorDebugIngest` (`EXPO_PUBLIC_DEBUG_INGEST_URL` = IP LAN du PC sur téléphone physique).
 */
import { getCursorDebugIngestUrl } from '@/utils/cursorDebugIngest';

const DEBUG_21424C = '21424c';

export function postDebugSession21424c(payload: {
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
  runId?: string;
}): void {
  const url = getCursorDebugIngestUrl();
  const body = {
    sessionId: DEBUG_21424C,
    runId: payload.runId ?? 'gps-debug',
    hypothesisId: payload.hypothesisId,
    location: payload.location,
    message: payload.message,
    data: payload.data ?? {},
    timestamp: Date.now(),
  };
  // Toujours émettre une ligne (APK release sans EXPO_PUBLIC_DEBUG_INGEST_URL → sinon aucune preuve).
  // #region agent log
  console.log(`[DEBUG_NDJSON_${DEBUG_21424C}]`, JSON.stringify(body));
  if (url) {
    void fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': DEBUG_21424C,
      },
      body: JSON.stringify(body),
    }).catch(() => {});
  }
  // #endregion
}
