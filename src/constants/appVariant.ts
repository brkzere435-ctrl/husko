import Constants from 'expo-constants';

export type AppVariant = 'all' | 'gerant' | 'client' | 'livreur' | 'assistant';

export function getAppVariant(): AppVariant {
  const v = Constants.expoConfig?.extra?.appVariant;
  if (v === 'gerant' || v === 'client' || v === 'livreur' || v === 'assistant') return v;
  return 'all';
}

/** Schémas profonds des APK sœurs (ouvrir l’une depuis l’autre). */
export const SIBLING_SCHEMES = {
  gerant: 'husko-gerant',
  client: 'husko-client',
  livreur: 'husko-livreur',
  assistant: 'husko-assistant',
} as const;
