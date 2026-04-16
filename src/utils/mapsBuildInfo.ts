import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { readHuskoExpoExtra } from '@/utils/readHuskoExpoExtra';

/** Repli si `extra.maps*KeyOk` est absent / faux après OTA alors que le prebuild a injecté une vraie clé. */
function androidMapsKeyFromExpoConfig(): string | null {
  const cfg = Constants.expoConfig?.android?.config as { googleMaps?: { apiKey?: string } } | undefined;
  const k = cfg?.googleMaps?.apiKey;
  return typeof k === 'string' && k.trim().length > 0 ? k.trim() : null;
}

function iosMapsKeyFromExpoConfig(): string | null {
  const cfg = Constants.expoConfig?.ios?.config as { googleMapsApiKey?: string } | undefined;
  const k = cfg?.googleMapsApiKey;
  return typeof k === 'string' && k.trim().length > 0 ? k.trim() : null;
}

function looksLikeRealMapsKey(k: string): boolean {
  return k.length >= 20 && !k.includes('REMPLACEZ');
}

/** Indique si la clé Maps du build actuel n’est pas un placeholder (voir app.config + expoConfig). */
export function isMapsKeyConfiguredForPlatform(): boolean {
  if (Platform.OS === 'web') return true;
  const e = readHuskoExpoExtra();
  if (Platform.OS === 'ios') {
    if (e.mapsIosKeyOk === true) return true;
    const k = iosMapsKeyFromExpoConfig();
    return k != null && looksLikeRealMapsKey(k);
  }
  if (Platform.OS === 'android') {
    if (e.mapsAndroidKeyOk === true) return true;
    const k = androidMapsKeyFromExpoConfig();
    return k != null && looksLikeRealMapsKey(k);
  }
  return false;
}
