import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';
import { FONT } from '@/constants/fonts';
import { colors, radius, spacing, surface } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { formatEuro } from '@/utils/formatEuro';

export default function AssistantHomeScreen() {
  const tier = useAssistantStore((s) => s.tier);
  const plan = tier ? SUBSCRIPTION_PLANS.find((p) => p.id === tier) : null;

  return (
    <WestCoastBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <View style={styles.hero}>
          <Text variant="headlineMedium" style={styles.brand} accessibilityRole="header">
            Copilote
          </Text>
          <Text variant="bodyLarge" style={styles.tag}>
            Une question, une réponse structurée.
          </Text>
        </View>

        <Card mode="elevated" style={[surface.elevated, styles.planRow]}>
          <Card.Content style={styles.planRowInner}>
            <Text variant="labelLarge" style={styles.planLabel}>
              Forfait
            </Text>
            <Text variant="titleMedium" style={styles.planValue}>
              {plan ? `${plan.name} · ${formatEuro(plan.priceEur)}` : '—'}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <Link href="/assistant/chat" asChild>
            <PrimaryButton title="Parler au Copilote" style={styles.btn} />
          </Link>
          <Link href="/assistant/abonnement" asChild>
            <PrimaryButton title="Choisir un forfait" variant="ghost" style={styles.btn} />
          </Link>
          <Link href="/assistant/reglages" asChild>
            <PrimaryButton title="App & mises à jour" variant="ghost" style={styles.btn} />
          </Link>
        </View>
      </SafeAreaView>
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  hero: { gap: spacing.xs },
  brand: {
    ...typography.heroBrand,
    fontSize: 32,
  },
  tag: {
    ...typography.bodyMuted,
    fontSize: 16,
    lineHeight: 22,
  },
  planRow: {
    borderRadius: radius.xl,
  },
  planRowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planLabel: {
    ...typography.caption,
    fontFamily: FONT.medium,
    color: colors.textMuted,
    fontWeight: '700',
  },
  planValue: { ...typography.body, fontFamily: FONT.bold, fontWeight: '800', color: colors.gold },
  actions: { gap: spacing.md, marginTop: 'auto', paddingBottom: spacing.xl },
  btn: { width: '100%' },
});
