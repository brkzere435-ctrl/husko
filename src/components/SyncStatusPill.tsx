import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { syncStatusPillVisual } from '@/constants/statusVisual';
import { colors, radius, spacing } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { openTechnicalFeedback } from '@/navigation/openTechnicalFeedback';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { formatCloudSyncErrorForUser } from '@/utils/cloudSyncUserMessage';

/** Pastille header : état liaison Firestore (visible sur tous les écrans du rôle). */
export function SyncStatusPill() {
  const cloud = isRemoteSyncEnabled();
  const writeErr = useHuskoStore((s) => s.cloudSyncWriteError);
  const listenErr = useHuskoStore((s) => s.cloudSyncListenError);
  const clearCloudSyncErrors = useHuskoStore((s) => s.clearCloudSyncErrors);
  const syncErr = writeErr || listenErr;
  const syncErrUser = formatCloudSyncErrorForUser(syncErr);

  const openSyncDetail = useCallback(() => {
    if (!syncErr) return;
    const detailParts = [writeErr, listenErr].filter(
      (x): x is string => typeof x === 'string' && x.trim() !== ''
    );
    const detail =
      detailParts.length > 0 ? detailParts.join('\n\n') : syncErr.trim() || undefined;
    openTechnicalFeedback({
      title: 'Synchronisation',
      body: syncErrUser ?? 'Synchronisation momentanément indisponible.',
      detail,
    });
  }, [listenErr, syncErr, syncErrUser, writeErr]);

  const a11y =
    syncErr != null && syncErr.length > 0
      ? `${syncErrUser ?? 'Problème de connexion'}. Appui court pour masquer l’indicateur. Appui long pour ouvrir le détail technique.`
      : cloud
        ? 'Synchronisation active : commandes partagées entre appareils'
        : 'Mode hors ligne : pas de synchronisation entre téléphones';

  return (
    <Pressable
      onPress={() => clearCloudSyncErrors()}
      onLongPress={syncErr ? openSyncDetail : undefined}
      delayLongPress={500}
      style={[styles.wrap, cloud ? (syncErr ? styles.cloudErr : styles.cloud) : styles.local]}
      accessibilityLabel={a11y}
      accessibilityRole="button"
    >
      <View style={[styles.dot, cloud ? (syncErr ? styles.dotErr : styles.dotOn) : styles.dotOff]} />
      <Text style={[typography.caption, styles.label, syncErr ? styles.labelErr : null]}>
        {syncErr ? 'Connexion' : cloud ? 'En ligne' : 'Local'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  cloud: {
    borderColor: syncStatusPillVisual.cloudBorder,
    backgroundColor: syncStatusPillVisual.cloudBg,
  },
  cloudErr: {
    borderColor: syncStatusPillVisual.errBorder,
    backgroundColor: syncStatusPillVisual.errBg,
  },
  local: {
    borderColor: colors.border,
    backgroundColor: syncStatusPillVisual.localBg,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotOn: { backgroundColor: colors.syncDotOk },
  dotErr: { backgroundColor: colors.syncDotErr },
  dotOff: { backgroundColor: colors.textMuted },
  label: { fontSize: 11, fontWeight: '800', color: colors.textMuted },
  labelErr: { color: colors.syncLabelErr },
});
