import Constants from 'expo-constants';
import { NativeModules } from 'react-native';

import type { HuskoExpoExtra } from '@/types/huskoExpoExtra';

/**
 * Clés Firebase injectées au build natif (`app.config.js` → `extra`).
 * Après un OTA, `Constants.expoConfig` peut refléter le manifest de mise à jour
 * sans ces champs ; le fichier `app.config` embarqué dans l’APK/AAB les conserve.
 */
const FIREBASE_EXTRA_KEYS: (keyof HuskoExpoExtra)[] = [
  'firebaseApiKey',
  'firebaseAuthDomain',
  'firebaseProjectId',
  'firebaseStorageBucket',
  'firebaseMessagingSenderId',
  'firebaseAppId',
];
let hasLoggedExtraProbe = false;

function isRoleVariant(v: unknown): v is 'gerant' | 'client' | 'livreur' | 'assistant' {
  return v === 'gerant' || v === 'client' || v === 'livreur' || v === 'assistant';
}

function readEmbeddedExtraPartial(): Partial<HuskoExpoExtra> {
  const raw = NativeModules.ExponentConstants?.manifest as string | Record<string, unknown> | undefined;
  if (raw == null) return {};
  try {
    const parsed = typeof raw === 'string' ? (JSON.parse(raw) as Record<string, unknown>) : raw;
    const extra = parsed?.extra;
    if (!extra || typeof extra !== 'object') return {};
    return extra as Partial<HuskoExpoExtra>;
  } catch {
    return {};
  }
}

/** Lecture typée de `extra` (app.config → expo-constants), avec repli sur le manifest embarqué. */
export function readHuskoExpoExtra(): HuskoExpoExtra {
  const embedded = readEmbeddedExtraPartial();
  const active = (Constants.expoConfig?.extra ?? {}) as HuskoExpoExtra;
  const merged = { ...embedded, ...active } as HuskoExpoExtra;
  const embeddedVariant = typeof embedded.appVariant === 'string' ? embedded.appVariant : null;
  const activeVariant = typeof active.appVariant === 'string' ? active.appVariant : null;
  if (isRoleVariant(embeddedVariant) && !isRoleVariant(activeVariant)) {
    merged.appVariant = embeddedVariant;
  }
  for (const k of FIREBASE_EXTRA_KEYS) {
    const cur = merged[k];
    if (typeof cur === 'string' && cur.trim() !== '') continue;
    const fallback = embedded[k];
    if (typeof fallback === 'string' && fallback.trim() !== '') {
      (merged as unknown as Record<string, string>)[k] = fallback;
    }
  }
  if (!hasLoggedExtraProbe) {
    hasLoggedExtraProbe = true;
    // #region agent log
    fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'995197'},body:JSON.stringify({sessionId:'995197',runId:'run2',hypothesisId:'H6',location:'readHuskoExpoExtra.ts:readHuskoExpoExtra',message:'expo extra merge snapshot',data:{embeddedAppVariant:typeof embedded.appVariant === 'string' ? embedded.appVariant : null,activeAppVariant:typeof active.appVariant === 'string' ? active.appVariant : null,resolvedAppVariant:typeof merged.appVariant === 'string' ? merged.appVariant : null,embeddedProjectId:typeof embedded.eas?.projectId === 'string' ? embedded.eas.projectId : null,activeProjectId:typeof active.eas?.projectId === 'string' ? active.eas.projectId : null,resolvedProjectId:typeof merged.eas?.projectId === 'string' ? merged.eas.projectId : null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }
  return merged;
}
