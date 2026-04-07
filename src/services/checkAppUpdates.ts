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
  // #region agent log
  fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'995197'},body:JSON.stringify({sessionId:'995197',runId:'run1',hypothesisId:'H1',location:'checkAppUpdates.ts:runOtaCheck:entry',message:'ota check entry',data:{mode,isDev:__DEV__,platform:Platform.OS,updatesEnabled:Updates.isEnabled,channel:Updates.channel ?? null,runtimeVersion:Updates.runtimeVersion ?? null,updateId:Updates.updateId ?? null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'995197'},body:JSON.stringify({sessionId:'995197',runId:'run1',hypothesisId:'H1',location:'checkAppUpdates.ts:runOtaCheck:checkForUpdate',message:'ota check result',data:{mode,isAvailable:result.isAvailable,channel:Updates.channel ?? null,runtimeVersion:Updates.runtimeVersion ?? null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!result.isAvailable) {
      if (mode === 'user') {
        Alert.alert('Husko', 'Vous avez déjà la dernière version pour ce canal.');
      }
      return;
    }
    const next = await Updates.fetchUpdateAsync();
    // #region agent log
    fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'995197'},body:JSON.stringify({sessionId:'995197',runId:'run1',hypothesisId:'H1',location:'checkAppUpdates.ts:runOtaCheck:fetchUpdate',message:'ota fetch result',data:{mode,isNew:next.isNew,updateId:Updates.updateId ?? null,channel:Updates.channel ?? null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
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
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'995197'},body:JSON.stringify({sessionId:'995197',runId:'run1',hypothesisId:'H1',location:'checkAppUpdates.ts:runOtaCheck:catch',message:'ota check error',data:{mode,error:error instanceof Error ? error.message : String(error)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (mode === 'user') {
      Alert.alert(
        'Husko',
        'Impossible de vérifier la mise à jour (réseau ou serveur). Réessayez plus tard.'
      );
    }
  }
}
