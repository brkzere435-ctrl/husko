import Constants from 'expo-constants';

import type { HuskoExpoExtra } from '@/types/huskoExpoExtra';

/** Lecture typée de `extra` (app.config → expo-constants). */
export function readHuskoExpoExtra(): HuskoExpoExtra {
  return (Constants.expoConfig?.extra ?? {}) as HuskoExpoExtra;
}
