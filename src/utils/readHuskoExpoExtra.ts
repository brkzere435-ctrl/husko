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
  for (const k of FIREBASE_EXTRA_KEYS) {
    const cur = merged[k];
    if (typeof cur === 'string' && cur.trim() !== '') continue;
    const fallback = embedded[k];
    if (typeof fallback === 'string' && fallback.trim() !== '') {
      (merged as unknown as Record<string, string>)[k] = fallback;
    }
  }
  return merged;
}
