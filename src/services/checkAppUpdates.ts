import * as Updates from 'expo-updates';
import { Platform } from 'react-native';

/**
 * EAS Update : télécharge le dernier bundle JS publié sur le même channel que le build.
 * Après fetch, recharge l’app (même APK).
 *
 * Publier une mise à jour :
 *   eas update --channel client --platform android --message "Correctifs"
 * (channel = celui défini dans eas.json pour le profil apk correspondant.)
 */
export async function checkAndReloadUpdatesAsync(): Promise<void> {
  if (__DEV__) return;
  if (Platform.OS === 'web') return;
  try {
    if (!Updates.isEnabled) return;
    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) return;
    const next = await Updates.fetchUpdateAsync();
    if (next.isNew) {
      await Updates.reloadAsync();
    }
  } catch {
    /* réseau / pas de channel : ignorer */
  }
}
