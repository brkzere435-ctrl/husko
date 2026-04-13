import * as Updates from 'expo-updates';
import { Alert, Platform } from 'react-native';

import { notifyAppUpdateReady } from '@/services/orderNotifications';
import { useHuskoStore } from '@/stores/useHuskoStore';

/** Vérification automatique en arrière-plan (toutes les N ms, app ouverte). */
export const OTA_PERIODIC_CHECK_MS = 15 * 60 * 1000;

/** Laisse le temps au système d’afficher la notification locale avant le reload. */
const MS_AFTER_UPDATE_NOTIFICATION = 1400;

type CheckMode = 'silent' | 'user';

/**
 * EAS Update : télécharge le dernier bundle JS publié sur le même channel que le build.
 * Après fetch : notification locale (si autorisée), puis recharge l’app (même APK).
 *
 * Publier une mise à jour :
 *   eas update --channel client --platform android --message "Correctifs"
 * (channel = celui défini dans eas.json pour le profil apk correspondant.)
 */
export async function checkAndReloadUpdatesAsync(): Promise<void> {
  await runOtaCheck('silent');
}

/** Depuis un bouton réglages : message si déjà à jour ou en cas d’erreur. */
export async function checkUpdatesWithUserFeedbackAsync(): Promise<void> {
  await runOtaCheck('user');
}

async function runOtaCheck(mode: CheckMode): Promise<void> {
  if (__DEV__) {
    if (mode === 'user') {
      Alert.alert(
        'Husko',
        'Les mises à jour OTA (EAS Update) ne s’appliquent pas en mode développement. Utilisez un build release.'
      );
    }
    return;
  }
  if (Platform.OS === 'web') {
    if (mode === 'user') {
      Alert.alert('Husko', 'Les mises à jour OTA concernent les applications Android / iOS installées.');
    }
    return;
  }
  try {
    if (!Updates.isEnabled) {
      if (mode === 'user') {
        Alert.alert('Husko', 'Les mises à jour en ligne sont désactivées sur ce build (Expo Go ou config).');
      }
      return;
    }
    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) {
      if (mode === 'user') {
        Alert.alert('Husko', 'Vous avez déjà la dernière version pour ce canal.');
      }
      return;
    }
    const next = await Updates.fetchUpdateAsync();
    if (next.isNew) {
      const { notificationsEnabled } = useHuskoStore.getState();
      if (notificationsEnabled) {
        const showedNotification = await notifyAppUpdateReady();
        if (showedNotification) {
          await new Promise<void>((resolve) => setTimeout(resolve, MS_AFTER_UPDATE_NOTIFICATION));
        }
      }
      await Updates.reloadAsync();
      return;
    }
    if (mode === 'user') {
      Alert.alert('Husko', 'Aucun bundle nouveau à appliquer pour le moment.');
    }
  } catch {
    if (mode === 'user') {
      Alert.alert(
        'Husko',
        'Impossible de vérifier la mise à jour (réseau ou serveur). Réessayez plus tard.'
      );
    }
  }
}
