import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';

/** Pastille header : état liaison Firestore (visible sur tous les écrans du rôle). */
export function SyncStatusPill() {
  const cloud = isRemoteSyncEnabled();
  return (
    <View
      style={[styles.wrap, cloud ? styles.cloud : styles.local]}
      accessibilityLabel={
        cloud
          ? 'Synchronisation Firebase active, commandes partagées entre appareils'
          : 'Mode local, pas de synchronisation cloud'
      }
    >
      <View style={[styles.dot, cloud ? styles.dotOn : styles.dotOff]} />
      <Text style={[typography.caption, styles.label]}>{cloud ? 'Cloud' : 'Local'}</Text>
    </View>
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
  local: {
    borderColor: colors.border,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotOn: { backgroundColor: '#5fd98a' },
  dotOff: { backgroundColor: colors.textMuted },
  label: { fontSize: 11, fontWeight: '800', color: colors.textMuted },
});
