import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';
import { useHuskoStore } from '@/stores/useHuskoStore';

/** Pastille header : état liaison Firestore (visible sur tous les écrans du rôle). */
export function SyncStatusPill() {
  const cloud = isRemoteSyncEnabled();
  const writeErr = useHuskoStore((s) => s.cloudSyncWriteError);
  const listenErr = useHuskoStore((s) => s.cloudSyncListenError);
  const clearCloudSyncErrors = useHuskoStore((s) => s.clearCloudSyncErrors);
  const syncErr = writeErr || listenErr;

  const a11y =
    syncErr != null && syncErr.length > 0
      ? `Erreur synchronisation : ${syncErr}. Touchez pour effacer le message.`
      : cloud
        ? 'Synchronisation Firebase active, commandes partagées entre appareils'
        : 'Mode local, pas de synchronisation cloud';

  return (
    <Pressable
      onPress={() => clearCloudSyncErrors()}
      style={[styles.wrap, cloud ? (syncErr ? styles.cloudErr : styles.cloud) : styles.local]}
      accessibilityLabel={a11y}
      accessibilityRole="button"
    >
      <View style={[styles.dot, cloud ? (syncErr ? styles.dotErr : styles.dotOn) : styles.dotOff]} />
      <Text style={[typography.caption, styles.label, syncErr ? styles.labelErr : null]}>
        {syncErr ? 'Erreur sync' : cloud ? 'Cloud' : 'Local'}
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
    borderColor: 'rgba(80, 200, 120, 0.5)',
    backgroundColor: 'rgba(20, 60, 40, 0.35)',
  },
  cloudErr: {
    borderColor: 'rgba(255, 100, 100, 0.65)',
    backgroundColor: 'rgba(80, 20, 20, 0.45)',
  },
  local: {
    borderColor: colors.border,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotOn: { backgroundColor: '#5fd98a' },
  dotErr: { backgroundColor: '#ff6b6b' },
  dotOff: { backgroundColor: colors.textMuted },
  label: { fontSize: 11, fontWeight: '800', color: colors.textMuted },
  labelErr: { color: '#ffb4b4' },
});
