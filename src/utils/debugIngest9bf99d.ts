/**
 * Alias historique — même pipeline que `cursorDebugIngest` (session `eaf67a` par défaut).
 */
import { postCursorDebugIngest } from '@/utils/cursorDebugIngest';

export function debugIngest9bf99d(payload: {
  runId: string;
  hypothesisId: string;
  location: string;
  message: string;
  data: Record<string, unknown>;
}): void {
  postCursorDebugIngest(
    {
      runId: payload.runId,
      hypothesisId: payload.hypothesisId,
      location: payload.location,
      message: payload.message,
      data: payload.data,
    },
    { mirrorConsole: true }
  );
}
