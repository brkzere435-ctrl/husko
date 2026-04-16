/**
 * Logs diagnostic [agent-debug] : toujours en console si __DEV__.
 * POST optionnel vers EXPO_PUBLIC_DEBUG_INGEST_URL (URL complète ingest, ex. http://IP_LAN:7618/ingest/...).
 * Sur téléphone physique, pointez l’URL vers le PC qui exécute l’ingest Cursor.
 * Désactiver tout : EXPO_PUBLIC_HUSKO_DISABLE_AGENT_DEBUG=1
 */
import { getCursorDebugSessionId } from '@/utils/cursorDebugIngest';

const AGENT_DEBUG_OFF = process.env.EXPO_PUBLIC_HUSKO_DISABLE_AGENT_DEBUG === '1';
const INGEST_URL = process.env.EXPO_PUBLIC_DEBUG_INGEST_URL?.trim() ?? '';
const SESSION_ID = getCursorDebugSessionId();

export type DebugAgentPayload = {
  location: string;
  message: string;
  data?: Record<string, unknown>;
  hypothesisId?: string;
};

export function debugAgentLog(payload: DebugAgentPayload): void {
  if (AGENT_DEBUG_OFF) return;
  const { location, message, data, hypothesisId } = payload;
  const merged = { ...data, hypothesisId, location };
  if (__DEV__) {
    console.log('[agent-debug]', message, merged);
  }
  if (!INGEST_URL) return;
  try {
    void fetch(INGEST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': SESSION_ID,
      },
      body: JSON.stringify({
        sessionId: SESSION_ID,
        location,
        message,
        data: merged,
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}
