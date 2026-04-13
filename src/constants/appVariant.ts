import * as Application from 'expo-application';

import { readHuskoExpoExtra } from '@/utils/readHuskoExpoExtra';

export type AppVariant = 'all' | 'gerant' | 'client' | 'livreur' | 'assistant';

function detectVariantFromNativeId(): AppVariant | null {
  const nativeId = Application.applicationId?.toLowerCase().trim();
  if (!nativeId) return null;
  if (nativeId.includes('.client')) return 'client';
  if (nativeId.includes('.livreur')) return 'livreur';
  if (nativeId.includes('.gerant')) return 'gerant';
  if (nativeId.includes('.copilot') || nativeId.includes('.assistant')) return 'assistant';
  // Hub « une app » : package historique Firebase / app.json et package unifié EAS.
  if (nativeId === 'com.husko.bynight' || nativeId === 'com.husko.app') return 'all';
  return null;
}

export function getAppVariant(): AppVariant {
  // Priorité à l'identité native installée (APK/AAB), plus fiable que le manifest OTA.
  const nativeVariant = detectVariantFromNativeId();
  const v = readHuskoExpoExtra().appVariant;
  let resolved: AppVariant;
  if (nativeVariant) {
    resolved = nativeVariant;
  } else if (v === 'all' || v === 'gerant' || v === 'client' || v === 'livreur' || v === 'assistant') {
    resolved = v;
  } else {
    resolved = 'all';
  }
  return resolved;
}

/** Schémas profonds des APK sœurs (ouvrir l’une depuis l’autre). */
export const SIBLING_SCHEMES = {
  gerant: 'husko-gerant',
  client: 'husko-client',
  livreur: 'husko-livreur',
  assistant: 'husko-assistant',
} as const;
