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
  if (nativeId === 'com.husko.bynight') return 'all';
  return null;
}

export function getAppVariant(): AppVariant {
  // Priorité à l'identité native installée (APK/AAB), plus fiable que le manifest OTA.
  const nativeVariant = detectVariantFromNativeId();
  if (nativeVariant) return nativeVariant;
  const v = readHuskoExpoExtra().appVariant;
  if (v === 'all' || v === 'gerant' || v === 'client' || v === 'livreur' || v === 'assistant') return v;
  return 'gerant';
}

/** Schémas profonds des APK sœurs (ouvrir l’une depuis l’autre). */
export const SIBLING_SCHEMES = {
  gerant: 'husko-gerant',
  client: 'husko-client',
  livreur: 'husko-livreur',
  assistant: 'husko-assistant',
} as const;
