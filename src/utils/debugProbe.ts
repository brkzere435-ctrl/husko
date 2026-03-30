/**
 * Sondes debug plan Husko : console en __DEV__ + envoi optionnel vers l’ingest local (émulateur / Expo Go).
 * Sur téléphone physique, l’ingest 127.0.0.1 échoue silencieusement — utiliser la sortie Metro ou logcat.
 */
const INGEST =
  process.env.EXPO_PUBLIC_DEBUG_INGEST_URL?.trim() ||
  'http://127.0.0.1:7781/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42';
const SESSION = process.env.EXPO_PUBLIC_DEBUG_SESSION_ID?.trim() || 'husko-boot';

type ProbePayload = {
  hypothesisId: string;
  message: string;
  data: Record<string, unknown>;
  runId?: string;
};

function postIngest(body: Record<string, unknown>) {
  fetch(INGEST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': SESSION,
    },
    body: JSON.stringify({ sessionId: SESSION, ...body }),
  }).catch(() => {});
}

export function emitDebugProbe(p: ProbePayload) {
  const line = {
    sessionId: SESSION,
    timestamp: Date.now(),
    location: 'debugProbe',
    ...p,
  };
  if (__DEV__) {
    console.log('[HuskoDebug]', JSON.stringify(line));
  }
  postIngest(line);
}

/** Appel unique au boot : config visuelle Expo + extra métier (sans secrets). */
export function emitBootDebugProbes(args: {
  icon: string | undefined;
  splashImage: string | undefined;
  adaptiveForeground: string | undefined;
  appVariant: string;
  mapsAndroidKeyOk: boolean;
  mapsIosKeyOk: boolean;
}) {
  emitDebugProbe({
    hypothesisId: 'H1_expo_visual_config',
    message: 'Chemins icon / splash / adaptive (build)',
    data: {
      icon: args.icon ?? null,
      splashImage: args.splashImage ?? null,
      adaptiveForeground: args.adaptiveForeground ?? null,
    },
    runId: 'boot',
  });
  emitDebugProbe({
    hypothesisId: 'H2_maps_keys_embedded',
    message: 'Flags Maps (tuiles si true)',
    data: {
      mapsAndroidKeyOk: args.mapsAndroidKeyOk,
      mapsIosKeyOk: args.mapsIosKeyOk,
    },
    runId: 'boot',
  });
  emitDebugProbe({
    hypothesisId: 'H3_app_variant',
    message: 'Variante app (hub / rôle)',
    data: { appVariant: args.appVariant },
    runId: 'boot',
  });
}
