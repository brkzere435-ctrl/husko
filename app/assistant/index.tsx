import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HuskoBackground } from '@/components/HuskoBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';
import { colors, spacing, surface } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useAssistantStore } from '@/stores/useAssistantStore';

export default function AssistantHomeScreen() {
  const tier = useAssistantStore((s) => s.tier);
  const plan = tier ? SUBSCRIPTION_PLANS.find((p) => p.id === tier) : null;

  return (
    <HuskoBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <View style={styles.hero}>
          <Text style={styles.brand}>Copilote</Text>
          <Text style={styles.tag}>Une question, une réponse structurée.</Text>
        </View>

        <View style={[surface.elevated, styles.planRow]}>
          <Text style={styles.planLabel}>Forfait</Text>
          <Text style={styles.planValue}>
            {plan ? `${plan.name} · ${plan.priceEur} €` : '—'}
          </Text>
        </View>

        <View style={styles.actions}>
          <Link href="/assistant/chat" asChild>
            <PrimaryButton title="Parler au Copilote" style={styles.btn} />
          </Link>
          <Link href="/assistant/abonnement" asChild>
            <PrimaryButton title="Choisir un forfait" variant="ghost" style={styles.btn} />
          </Link>
        </View>
      </SafeAreaView>
    </HuskoBackground>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  planLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '700' },
  planValue: { ...typography.body, fontWeight: '800', color: colors.gold },
  actions: { gap: spacing.md, marginTop: 'auto', paddingBottom: spacing.xl },
  btn: { width: '100%' },
});
