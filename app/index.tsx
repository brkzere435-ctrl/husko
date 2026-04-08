import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { Link, Redirect } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/BrandMark';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CLIENT_PHONE_DISPLAY, CLIENT_PHONE_TEL } from '@/constants/clientExperience';
import { getAppVariant } from '@/constants/appVariant';
import { deliveryHoursLabel } from '@/constants/hours';
import { VENUE_TAGLINE_HUB } from '@/constants/venue';
import { appScreenVisual } from '@/constants/appScreenVisual';
import { colors, elevation, radius, spacing, surface } from '@/constants/theme';
import { WC, wcSectionLabel } from '@/constants/westCoastTheme';
import { FONT } from '@/constants/fonts';
import { typography } from '@/constants/typography';
import { postRuntimeDebugIngest } from '@/utils/debugIngestRuntime';

export default function HubScreen() {
  const role = getAppVariant();
  if (role === 'all') {
    // #region agent log
    postRuntimeDebugIngest({
      runId: 'run2',
      hypothesisId: 'H6',
      location: 'app/index.tsx:HubScreen',
      message: 'variant resolved to all',
      data: {
        scheme: Constants.expoConfig?.scheme ?? null,
        slug: Constants.expoConfig?.slug ?? null,
        version: Constants.expoConfig?.version ?? null,
        nativeBuildVersion: Constants.nativeBuildVersion ?? null,
        updateId: Updates.updateId ?? null,
        channel: Updates.channel ?? null,
      },
    });
    // #endregion
  }
  if (role === 'all') return <Redirect href="/gerant" />;
  if (role === 'gerant') return <Redirect href="/gerant" />;
  if (role === 'client') return <Redirect href="/client" />;
  if (role === 'livreur') return <Redirect href="/livreur" />;
  if (role === 'assistant') return <Redirect href="/assistant" />;

  const version = Constants.expoConfig?.version ?? '—';
  const nativeBuild =
    Constants.nativeBuildVersion && String(Constants.nativeBuildVersion).length > 0
      ? String(Constants.nativeBuildVersion)
      : null;
  const bundleLine =
    Platform.OS === 'web' || !Updates.isEnabled
      ? null
      : Updates.updateId
        ? `Bundle JS (OTA) : ${Updates.updateId.slice(0, 8)}…`
        : 'Bundle JS : embarqué dans l’APK';

  return (
    <WestCoastBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text variant="labelSmall" style={styles.wcKicker}>
              HUSKO · BY NIGHT
            </Text>
            <Text variant="bodyMedium" style={styles.unifiedTag}>
              Une installation · tout l’écosystème
            </Text>
            <View style={[styles.logoFrame, elevation.hero, surface.neonPanelStrong]}>
              <BrandMark tagline={VENUE_TAGLINE_HUB} />
              <View style={styles.logoRule} />
              <View style={styles.pill}>
                <Text variant="bodySmall" style={styles.pillTxt}>
                  {deliveryHoursLabel()}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => void Linking.openURL(`tel:${CLIENT_PHONE_TEL}`)}
              style={({ pressed }) => [styles.phoneBtn, pressed && styles.phonePressed]}
              accessibilityRole="link"
              accessibilityLabel={`Appeler le ${CLIENT_PHONE_DISPLAY}`}
            >
              <Text variant="titleLarge" style={styles.phone}>
                {CLIENT_PHONE_DISPLAY}
              </Text>
              <Text variant="bodySmall" style={styles.phoneHint}>
                Appuyer pour appeler
              </Text>
            </Pressable>
          </View>

          <Text variant="titleSmall" style={[wcSectionLabel, styles.sectionLabel]} accessibilityRole="header">
            Choisir un espace
          </Text>
          <Surface style={[surface.neonPanel, styles.gridWrap]} elevation={2}>
            <View style={styles.grid}>
            <Link href="/client" asChild>
              <PrimaryButton title="Commander" style={styles.btn} />
            </Link>
            <Link href="/livreur" asChild>
              <PrimaryButton title="Espace livreur" style={styles.btn} />
            </Link>
            <Link href="/gerant" asChild>
              <PrimaryButton title="Espace gérant" variant="ghost" style={styles.btn} />
            </Link>
            <Link href="/assistant" asChild>
              <PrimaryButton title="Copilote" variant="ghost" style={styles.btn} />
            </Link>
            </View>
          </Surface>

          <Text variant="bodySmall" style={styles.footer} selectable>
            Husko By Night · v{version}
            {nativeBuild != null ? ` · APK ${nativeBuild}` : ''}
            {bundleLine != null ? `\n${bundleLine}` : ''}
            {'\n'}
            Tout le service — une seule application.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: { marginBottom: spacing.lg, alignItems: 'center' },
  wcKicker: {
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 4,
    color: WC.neonCyan,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  unifiedTag: {
    ...typography.caption,
    fontFamily: FONT.medium,
    color: WC.gold,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: spacing.md,
    opacity: 0.95,
  },
  logoFrame: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    width: '100%',
    maxWidth: 380,
  },
  logoRule: {
    width: 56,
    height: 4,
    marginTop: spacing.md,
    backgroundColor: colors.posterRed,
    borderRadius: 2,
  },
  pill: {
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: appScreenVisual.goldTint10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  pillTxt: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  phoneBtn: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  phonePressed: { opacity: 0.88 },
  phone: {
    fontFamily: FONT.bold,
    color: WC.gold,
    fontSize: 22,
    letterSpacing: 0.6,
  },
  phoneHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
  sectionLabel: { marginBottom: spacing.sm, alignSelf: 'flex-start' },
  gridWrap: { padding: spacing.lg, marginBottom: spacing.lg, width: '100%', maxWidth: 420, alignSelf: 'center' },
  grid: { gap: spacing.md },
  btn: { width: '100%' },
  footer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 'auto',
    paddingTop: spacing.md,
    opacity: 0.85,
  },
});
