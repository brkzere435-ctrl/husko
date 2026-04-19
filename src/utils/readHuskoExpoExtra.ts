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
  'googleAuthWebClientId',
  'googleAuthAndroidClientId',
  'googleAuthIosClientId',
];
function isRoleVariant(v: unknown): v is 'gerant' | 'client' | 'livreur' | 'assistant' {
  return v === 'gerant' || v === 'client' || v === 'livreur' || v === 'assistant';
}
function isKnownVariant(v: unknown): v is 'all' | 'gerant' | 'client' | 'livreur' | 'assistant' {
  return v === 'all' || isRoleVariant(v);
}

function parseManifestExtra(raw: string | Record<string, unknown> | undefined): Partial<HuskoExpoExtra> {
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

function readEmbeddedExtraPartial(): Partial<HuskoExpoExtra> {
  const fromNative = parseManifestExtra(
    NativeModules.ExponentConstants?.manifest as string | Record<string, unknown> | undefined
  );
  if (Object.keys(fromNative).length > 0) return fromNative;
  // Repli : manifest embarqué exposé par expo-constants (certains runtimes / SDK n’alimentent pas ExponentConstants.manifest).
  const unwarn = (Constants as { __unsafeNoWarnManifest?: { extra?: unknown } }).__unsafeNoWarnManifest;
  const ex = unwarn?.extra;
  if (ex && typeof ex === 'object') return ex as Partial<HuskoExpoExtra>;
  return {};
}

/** Lecture typée de `extra` (app.config → expo-constants), avec repli sur le manifest embarqué. */
export function readHuskoExpoExtra(): HuskoExpoExtra {
  const embedded = readEmbeddedExtraPartial();
  const active = (Constants.expoConfig?.extra ?? {}) as HuskoExpoExtra;
  const merged = { ...embedded, ...active } as HuskoExpoExtra;
  const embeddedVariant = typeof embedded.appVariant === 'string' ? embedded.appVariant : null;
  const activeVariant = typeof active.appVariant === 'string' ? active.appVariant : null;
  // Source de vérité : manifest embarqué APK quand lisible ; sinon manifest actif (OTA) ; sinon hub.
  if (isKnownVariant(embeddedVariant)) {
    merged.appVariant = embeddedVariant;
  } else if (isKnownVariant(activeVariant)) {
    merged.appVariant = activeVariant;
  } else {
    merged.appVariant = 'all';
  }
  for (const k of FIREBASE_EXTRA_KEYS) {
    const cur = merged[k];
    if (typeof cur === 'string' && cur.trim() !== '') continue;
    const fallback = embedded[k];
    if (typeof fallback === 'string' && fallback.trim() !== '') {
      (merged as unknown as Record<string, string>)[k] = fallback;
    }
  }
  // Flags Maps : un update OTA peut omettre `extra.maps*KeyOk` — ne pas repasser à « pas de clé »
  // alors que l’APK embarque déjà une vraie clé native (sinon MapView jamais activée après OTA).
  if (embedded.mapsAndroidKeyOk === true) {
    merged.mapsAndroidKeyOk = true;
  }
  if (embedded.mapsIosKeyOk === true) {
    merged.mapsIosKeyOk = true;
  }
  return merged;
}
