import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT } from '@/constants/fonts';
import { typography } from '@/constants/typography';
import { colors, radius, spacing } from '@/constants/theme';
import { OTA_PERIODIC_CHECK_MS, checkUpdatesWithUserFeedbackAsync } from '@/services/checkAppUpdates';
import { readHuskoExpoExtra } from '@/utils/readHuskoExpoExtra';

function formatMs(ms: number): string {
  const m = Math.round(ms / 60000);
  if (m >= 60) return `${Math.round(m / 60)} h`;
  return `${m} min`;
}

/** Bloc version + canal EAS + diagnostic bundle (pourquoi l’UI peut sembler « ancienne »). */
export function OtaUpdateSection() {
  const version = Constants.expoConfig?.version ?? '—';
  const channel = Updates.channel ?? '—';
  const updateIdFull = Updates.updateId ?? null;
  const updateIdShort = updateIdFull ? `${updateIdFull.slice(0, 8)}…` : '— (bundle embarqué au build)';
  const runtimeVersion = Updates.runtimeVersion ?? '—';
  const native = Platform.OS !== 'web';
  const extra = readHuskoExpoExtra();
  const appVariant = extra.appVariant != null && String(extra.appVariant) !== '' ? String(extra.appVariant) : '—';

  /** Android versionCode / iOS CFBundleVersion — utile pour vérifier l’APK installé. */
  const nativeBuild =
    Constants.nativeBuildVersion && String(Constants.nativeBuildVersion).length > 0
      ? String(Constants.nativeBuildVersion)
      : null;

  const isDev = __DEV__;
  const otaEnabled = Updates.isEnabled;

  return (
    <View style={styles.box}>
      <Text style={typography.section}>Mise à jour de l’app (OTA)</Text>

      <View style={[styles.pill, isDev ? styles.pillDev : styles.pillRelease]}>
        <Text style={styles.pillText}>
          {isDev
            ? 'Mode : développement (Metro)'
            : otaEnabled
              ? 'Mode : build installé (OTA activée)'
              : 'Mode : build installé (OTA désactivée)'}
        </Text>
      </View>

      <Text style={[typography.caption, styles.muted]}>
        Variante app (extra) : {appVariant}
        {'\n'}
        Version affichée : {version}
        {nativeBuild != null ? `\nBuild natif (APK / store) : ${nativeBuild}` : ''}
        {'\n'}
        Runtime EAS : {runtimeVersion}
        {'\n'}
        Canal EAS Update : {channel}
        {'\n'}
        Dernier bundle OTA (aperçu) : {updateIdShort}
      </Text>
      {updateIdFull ? (
        <Text style={[styles.mono, styles.muted]} selectable>
          ID complet : {updateIdFull}
        </Text>
      ) : null}

      {isDev ? (
        <View style={styles.hintBlock}>
          <Text style={styles.hintTitle}>Pour voir la dernière interface en dev</Text>
          <Text style={[typography.caption, styles.muted]}>
            Le JS vient de Metro, pas d’OTA. À la racine du projet :{' '}
            <Text style={styles.code}>npx expo start --clear</Text>
            {'\n'}
            Puis recharge l’app. Variante actuelle (extra) : <Text style={styles.code}>{appVariant}</Text>
            {' — '}
            aligne avec <Text style={styles.code}>EXPO_PUBLIC_APP_VARIANT</Text> ou les scripts{' '}
            <Text style={styles.code}>npm run start:client</Text> / <Text style={styles.code}>start:gerant</Text> etc.
          </Text>
        </View>
      ) : native ? (
        <View style={styles.hintBlock}>
          <Text style={styles.hintTitle}>Si l’interface semble ancienne</Text>
          <Text style={[typography.caption, styles.muted]}>
            Ce que tu vois correspond au JS embarqué dans l’APK au moment du build, sauf si une mise à jour
            OTA plus récente a été publiée sur le canal « {String(channel)} ».
            {'\n\n'}
            • Refais un <Text style={styles.code}>eas build</Text> avec les derniers commits, réinstalle.
            {'\n'}
            • Ou publie <Text style={styles.code}>eas update --channel {String(channel)}</Text> (canal = celui
            du profil EAS de ton APK), puis « Vérifier les mises à jour » ci-dessous.
          </Text>
        </View>
      ) : null}

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
  pill: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  pillDev: {
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    borderColor: 'rgba(34, 211, 238, 0.4)',
  },
  pillRelease: {
    backgroundColor: 'rgba(253, 230, 138, 0.1)',
    borderColor: 'rgba(253, 230, 138, 0.35)',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.2,
  },
  hintBlock: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.xs,
  },
  hintTitle: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: colors.gold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  code: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 11,
    color: '#67e8f9',
    fontWeight: '700',
  },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 11,
    lineHeight: 16,
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
