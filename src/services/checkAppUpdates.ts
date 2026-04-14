import * as Updates from 'expo-updates';
import { Alert, Platform } from 'react-native';

import { notifyAppUpdateReady } from '@/services/orderNotifications';
import { useHuskoStore } from '@/stores/useHuskoStore';

/** Vérification automatique en arrière-plan (toutes les N ms, app ouverte). */
export const OTA_PERIODIC_CHECK_MS = 15 * 60 * 1000;

/** Laisse le temps au système d’afficher la notification locale avant le reload. */
const MS_AFTER_UPDATE_NOTIFICATION = 1400;
const ENV_DEBUG_INGEST_URL = process.env.EXPO_PUBLIC_DEBUG_INGEST_URL?.trim();
const OTA_DEBUG_INGEST_URL =
  ENV_DEBUG_INGEST_URL ||
  (__DEV__ ? 'http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42' : null);

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

function otaDebugLog(
  runId: string,
  hypothesisId: 'H1' | 'H2' | 'H3' | 'H4' | 'H5',
  location: string,
  message: string,
  data: Record<string, unknown>
) {
  if (!OTA_DEBUG_INGEST_URL) return;
  // #region agent log
  fetch(OTA_DEBUG_INGEST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '971882' },
    body: JSON.stringify({
      sessionId: '971882',
      runId,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

async function runOtaCheck(mode: CheckMode): Promise<void> {
  const runId = `ota-${Date.now().toString(36)}-${mode}`;
  otaDebugLog(runId, 'H1', 'checkAppUpdates.ts:runOtaCheck:entry', 'runOtaCheck called', {
    mode,
    platform: Platform.OS,
    dev: __DEV__,
    updatesEnabled: Updates.isEnabled,
  });
  if (__DEV__) {
    otaDebugLog(runId, 'H1', 'checkAppUpdates.ts:runOtaCheck:guard-dev', 'guarded in __DEV__', { mode });
    if (mode === 'user') {
      Alert.alert(
        'Husko',
        'Les mises à jour OTA (EAS Update) ne s’appliquent pas en mode développement. Utilisez un build release.'
      );
    }
    return;
  }
  if (Platform.OS === 'web') {
    otaDebugLog(runId, 'H1', 'checkAppUpdates.ts:runOtaCheck:guard-web', 'guarded on web', { mode });
    if (mode === 'user') {
      Alert.alert('Husko', 'Les mises à jour OTA concernent les applications Android / iOS installées.');
    }
    return;
  }
  try {
    if (!Updates.isEnabled) {
      otaDebugLog(runId, 'H1', 'checkAppUpdates.ts:runOtaCheck:updates-disabled', 'Updates.isEnabled is false', {
        mode,
      });
      if (mode === 'user') {
        Alert.alert('Husko', 'Les mises à jour en ligne sont désactivées sur ce build (Expo Go ou config).');
      }
      return;
    }
    otaDebugLog(runId, 'H2', 'checkAppUpdates.ts:runOtaCheck:check-start', 'checkForUpdateAsync start', { mode });
    const result = await Updates.checkForUpdateAsync();
    otaDebugLog(runId, 'H2', 'checkAppUpdates.ts:runOtaCheck:check-done', 'checkForUpdateAsync done', {
      mode,
      isAvailable: result.isAvailable,
    });
    if (!result.isAvailable) {
      if (mode === 'user') {
        Alert.alert('Husko', 'Vous avez déjà la dernière version pour ce canal.');
      }
      return;
    }
    otaDebugLog(runId, 'H3', 'checkAppUpdates.ts:runOtaCheck:fetch-start', 'fetchUpdateAsync start', { mode });
    const next = await Updates.fetchUpdateAsync();
    otaDebugLog(runId, 'H3', 'checkAppUpdates.ts:runOtaCheck:fetch-done', 'fetchUpdateAsync done', {
      mode,
      isNew: next.isNew,
    });
    if (next.isNew) {
      const { notificationsEnabled } = useHuskoStore.getState();
      if (notificationsEnabled) {
        const showedNotification = await notifyAppUpdateReady();
        otaDebugLog(
          runId,
          'H4',
          'checkAppUpdates.ts:runOtaCheck:notify',
          'notifyAppUpdateReady result',
          { mode, showedNotification }
        );
        if (showedNotification) {
          await new Promise<void>((resolve) => setTimeout(resolve, MS_AFTER_UPDATE_NOTIFICATION));
        }
      }
      otaDebugLog(runId, 'H4', 'checkAppUpdates.ts:runOtaCheck:reload-call', 'Updates.reloadAsync called', {
        mode,
      });
      await Updates.reloadAsync();
      return;
    }
    if (mode === 'user') {
      Alert.alert('Husko', 'Aucun bundle nouveau à appliquer pour le moment.');
    }
  } catch (err) {
    otaDebugLog(runId, 'H5', 'checkAppUpdates.ts:runOtaCheck:catch', 'runOtaCheck threw error', {
      mode,
      error: err instanceof Error ? err.message : String(err),
    });
    if (mode === 'user') {
      Alert.alert(
        'Husko',
        'Impossible de vérifier la mise à jour (réseau ou serveur). Réessayez plus tard.'
      );
    }
  }
}
