import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { typography } from '@/constants/typography';
import { colors, radius, spacing } from '@/constants/theme';
import { OTA_PERIODIC_CHECK_MS, checkUpdatesWithUserFeedbackAsync } from '@/services/checkAppUpdates';

function formatMs(ms: number): string {
  const m = Math.round(ms / 60000);
  if (m >= 60) return `${Math.round(m / 60)} h`;
  return `${m} min`;
}

/** Bloc version + canal EAS + bouton vérification manuelle (builds release). */
export function OtaUpdateSection() {
  const version = Constants.expoConfig?.version ?? '—';
  const channel = Updates.channel ?? '—';
  const updateId = Updates.updateId ? `${Updates.updateId.slice(0, 8)}…` : '—';
  const native = Platform.OS !== 'web';
  /** Android versionCode / iOS CFBundleVersion — utile pour vérifier l’APK installé. */
  const nativeBuild =
    Constants.nativeBuildVersion && String(Constants.nativeBuildVersion).length > 0
      ? String(Constants.nativeBuildVersion)
      : null;

  return (
    <View style={styles.box}>
      <Text style={typography.section}>Mise à jour de l’app (OTA)</Text>
      <Text style={[typography.caption, styles.muted]}>
        Version affichée : {version}
        {nativeBuild != null ? `\nBuild natif (APK / store) : ${nativeBuild}` : ''}
        {'\n'}
        Canal EAS Update : {channel}
        {'\n'}
        Dernier bundle : {updateId}
      </Text>
      <Text style={[typography.caption, styles.muted]}>
        Vérification automatique : au lancement, au retour de l’app, puis toutes les{' '}
        {formatMs(OTA_PERIODIC_CHECK_MS)} environ tant que l’app reste ouverte.
      </Text>
      {native ? (
        <Pressable
          onPress={() => void checkUpdatesWithUserFeedbackAsync()}
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          accessibilityRole="button"
          accessibilityLabel="Vérifier les mises à jour"
        >
          <Text style={styles.btnText}>Vérifier les mises à jour maintenant</Text>
        </Pressable>
      ) : (
        <Text style={[typography.caption, styles.muted]}>
          Sur navigateur, installez l’APK / l’app iOS pour recevoir les mises à jour OTA.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.cardElevated,
    gap: spacing.sm,
  },
  muted: { color: colors.textMuted, lineHeight: 18 },
  btn: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.borderGlow,
  },
  btnPressed: { opacity: 0.88 },
  btnText: {
    color: colors.gold,
    fontWeight: '800',
    fontSize: 14,
  },
});
