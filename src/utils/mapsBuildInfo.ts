import Constants from 'expo-constants';
import { Platform } from 'react-native';

type HuskoExtra = {
  mapsAndroidKeyOk?: boolean;
  mapsIosKeyOk?: boolean;
};

/** Indique si la clé Maps du build actuel n’est pas le placeholder (voir app.config extra). */
export function isMapsKeyConfiguredForPlatform(): boolean {
  if (Platform.OS === 'web') return true;
  const e = (Constants.expoConfig?.extra ?? {}) as HuskoExtra;
  if (Platform.OS === 'ios') return e.mapsIosKeyOk === true;
  return e.mapsAndroidKeyOk === true;
}
