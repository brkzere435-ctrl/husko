/**
 * Capture console warn/error (layout, VirtualizedList, etc.) pour diagnostic.
 * En __DEV__ : toujours mirror via `debugAgentLog` → console **[agent-debug]** visible dans Metro sur le PC.
 * POST NDJSON vers l’ingest : uniquement si `EXPO_PUBLIC_DEBUG_INGEST_URL` pointe vers le PC (IP LAN, pas 127.0.0.1 depuis un téléphone).
 * Désactiver : `EXPO_PUBLIC_HUSKO_DISABLE_AGENT_DEBUG=1`.
 */
import { debugAgentLog } from '@/utils/debugAgentLog';

function layoutRelated(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes('flex') ||
    m.includes('layout') ||
    m.includes('yoga') ||
    m.includes('virtualized') ||
    m.includes('scrollview') ||
    m.includes('constraint') ||
    m.includes('measure') ||
    m.includes('nested scroll') ||
    m.includes('shadow') ||
    (m.includes('height') && (m.includes('undefined') || m.includes('0'))) ||
    (m.includes('width') && m.includes('must'))
  );
}

function emitRenderDebug(payload: {
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
}): void {
  debugAgentLog({
    location: payload.location,
    message: payload.message,
    hypothesisId: payload.hypothesisId,
    data: payload.data,
  });
}

/** Chaîne après LogBox : duplique warn/error vers agent-debug + ingest optionnel. */
export function installRenderLayoutDebugTap(): void {
  if (!__DEV__) return;

  const prevWarn = console.warn.bind(console);
  const prevErr = console.error.bind(console);

  console.warn = (...args: unknown[]) => {
    prevWarn(...args);
    const msg = args
      .map((a) => (typeof a === 'string' ? a : String(a)))
      .join(' ')
      .slice(0, 800);
    emitRenderDebug({
      hypothesisId: 'H2',
      location: 'debugRenderLayoutLogs.ts:console.warn',
      message: msg,
      data: { layoutRelated: layoutRelated(msg), channel: 'warn' },
    });
  };

  console.error = (...args: unknown[]) => {
    prevErr(...args);
    const msg = args
      .map((a) => (typeof a === 'string' ? a : String(a)))
      .join(' ')
      .slice(0, 1200);
    emitRenderDebug({
      hypothesisId: 'H1',
      location: 'debugRenderLayoutLogs.ts:console.error',
      message: msg,
      data: { layoutRelated: layoutRelated(msg), channel: 'error' },
    });
  };
}

/** Erreur de rendu capturée par ErrorBoundary (hors flux console). */
export function logErrorBoundaryCatch(error: Error, info: { componentStack?: string | null }): void {
  emitRenderDebug({
    hypothesisId: 'H3',
    location: 'ErrorBoundary.componentDidCatch',
    message: `${error.name}: ${error.message}`.slice(0, 800),
    data: {
      stack: error.stack?.slice(0, 1200),
      componentStack: info.componentStack?.slice(0, 1200),
    },
  });
}

let rootLayoutLogged = false;

/** Première mesure racine : détecter largeur/hauteur nulle (contraintes Yoga suspects). */
export function logRootLayoutOnce(width: number, height: number): void {
  if (!__DEV__ || rootLayoutLogged) return;
  rootLayoutLogged = true;
  emitRenderDebug({
    hypothesisId: 'H4',
    location: 'RootLayout.onLayout',
    message: `rootLayout ${Math.round(width)}x${Math.round(height)}`,
    data: {
      width,
      height,
      suspectZero: width === 0 || height === 0,
    },
  });
}
