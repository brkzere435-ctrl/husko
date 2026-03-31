import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { Link, Redirect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/BrandMark';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CLIENT_PHONE_DISPLAY, CLIENT_PHONE_TEL } from '@/constants/clientExperience';
import { getAppVariant } from '@/constants/appVariant';
import { deliveryHoursLabel } from '@/constants/hours';
import { VENUE_TAGLINE_HUB } from '@/constants/venue';
import { colors, elevation, radius, spacing, surface } from '@/constants/theme';
import { WC, wcSectionLabel } from '@/constants/westCoastTheme';
import { typography } from '@/constants/typography';

export default function HubScreen() {
  const role = getAppVariant();
  if (role === 'gerant') return <Redirect href="/gerant" />;
  if (role === 'client') return <Redirect href="/client" />;
  if (role === 'livreur') return <Redirect href="/livreur" />;
  if (role === 'assistant') return <Redirect href="/assistant" />;

  const version = Constants.expoConfig?.version ?? '—';

  return (
    <WestCoastBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.wcKicker}>HUSKO · BY NIGHT</Text>
            <Text style={styles.unifiedTag}>Une installation · tout l’écosystème</Text>
            <View style={[styles.logoFrame, elevation.hero, surface.neonPanelStrong]}>
              <BrandMark tagline={VENUE_TAGLINE_HUB} />
              <View style={styles.logoRule} />
              <View style={styles.pill}>
                <Text style={styles.pillTxt}>{deliveryHoursLabel()}</Text>
              </View>
            </View>
            <Pressable
              onPress={() => void Linking.openURL(`tel:${CLIENT_PHONE_TEL}`)}
              style={({ pressed }) => [styles.phoneBtn, pressed && styles.phonePressed]}
              accessibilityRole="link"
              accessibilityLabel={`Appeler le ${CLIENT_PHONE_DISPLAY}`}
            >
              <Text style={styles.phone}>{CLIENT_PHONE_DISPLAY}</Text>
              <Text style={styles.phoneHint}>Appuyer pour appeler</Text>
            </Pressable>
          </View>

          <Text style={[wcSectionLabel, styles.sectionLabel]}>Choisir un espace</Text>
          <View style={[surface.neonPanel, styles.gridWrap]}>
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
          </View>

          <Text style={styles.footer}>
            Husko By Night · v{version}
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
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 4,
    color: WC.neonCyan,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  unifiedTag: {
    ...typography.caption,
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
    backgroundColor: 'rgba(240, 208, 80, 0.1)',
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
    color: WC.gold,
    fontWeight: '800',
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
