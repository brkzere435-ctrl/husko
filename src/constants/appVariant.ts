import * as Application from 'expo-application';

import { readHuskoExpoExtra } from '@/utils/readHuskoExpoExtra';
import { postSessionA64698Ingest } from '@/utils/debugIngestRuntime';

export type AppVariant = 'all' | 'gerant' | 'client' | 'livreur' | 'assistant';

let __huskoDebugVariantResolvedOnce = false;
const SUPPORT_DEBUG_ENABLED =
  __DEV__ || process.env.EXPO_PUBLIC_HUSKO_DEBUG_BOOT === '1';

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
  const nativeId = Application.applicationId?.toLowerCase().trim() ?? null;
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
  if (SUPPORT_DEBUG_ENABLED && !__huskoDebugVariantResolvedOnce) {
    __huskoDebugVariantResolvedOnce = true;
    // #region agent log
    postSessionA64698Ingest({
      location: 'src/constants/appVariant.ts:getAppVariant',
      message: 'resolved app variant (first call)',
      data: { nativeId, nativeVariant, extraAppVariant: v, resolved },
      runId: 'pre',
      hypothesisId: 'H1',
    });
    console.warn(
      '[HUSKO_DEBUG_a64698_H1]',
      JSON.stringify({ nativeId, nativeVariant, extraAppVariant: v, resolved })
    );
    // #endregion
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
