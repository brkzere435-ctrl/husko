import { Link, Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/BrandMark';
import { HuskoBackground } from '@/components/HuskoBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { getAppVariant } from '@/constants/appVariant';
import { deliveryHoursLabel } from '@/constants/hours';
import { VENUE_TAGLINE_HUB } from '@/constants/venue';
import { colors, elevation, radius, spacing } from '@/constants/theme';
import { typography } from '@/constants/typography';

export default function HubScreen() {
  const role = getAppVariant();
  if (role === 'gerant') return <Redirect href="/gerant" />;
  if (role === 'client') return <Redirect href="/client" />;
  if (role === 'livreur') return <Redirect href="/livreur" />;
  if (role === 'assistant') return <Redirect href="/assistant" />;

  return (
    <HuskoBackground>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={[styles.logoFrame, elevation.hero]}>
            <BrandMark tagline={VENUE_TAGLINE_HUB} />
            <View style={styles.logoRule} />
            <View style={styles.pill}>
              <Text style={styles.pillTxt}>{deliveryHoursLabel()}</Text>
            </View>
          </View>
          <Text style={styles.phone}>06 29 39 74 30</Text>
        </View>

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
        </View>
      </SafeAreaView>
    </HuskoBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  header: { marginBottom: spacing.lg, alignItems: 'center' },
  logoFrame: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    borderRadius: radius.xl,
    backgroundColor: colors.glass,
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
  phone: {
    marginTop: spacing.lg,
    color: colors.gold,
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: 0.6,
  },
  grid: { gap: spacing.md, flex: 1, justifyContent: 'center', paddingBottom: spacing.lg },
  btn: { width: '100%' },
});
