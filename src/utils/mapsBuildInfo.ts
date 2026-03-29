import { Platform } from 'react-native';

import { readHuskoExpoExtra } from '@/utils/readHuskoExpoExtra';

/** Indique si la clé Maps du build actuel n’est pas le placeholder (voir app.config extra). */
export function isMapsKeyConfiguredForPlatform(): boolean {
  if (Platform.OS === 'web') return true;
  const e = readHuskoExpoExtra();
  if (Platform.OS === 'ios') return e.mapsIosKeyOk === true;
  return e.mapsAndroidKeyOk === true;
}
