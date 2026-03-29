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
        <View style={[surface.glass, styles.block]}>
          <Text style={typography.title}>Copilote</Text>
          <Text style={styles.lead}>
            Connaissance, conception et dialogue — branché sur ton API sécurisée (pas de clés dans
            l’app).
          </Text>
        </View>

        <View style={[surface.elevated, styles.card]}>
          <Text style={styles.cardLabel}>Forfait actuel</Text>
          <Text style={styles.cardValue}>
            {plan ? `${plan.name} · ${plan.priceEur} €` : 'Non renseigné (abonnement à valider)'}
          </Text>
          <Text style={styles.cardHint}>
            Après paiement Revolut, confirme le niveau ici ou via ton backend (webhook).
          </Text>
        </View>

        <View style={styles.actions}>
          <Link href="/assistant/abonnement" asChild>
            <PrimaryButton title="Forfaits · Premium 180 € en tête" style={styles.btn} />
          </Link>
          <Link href="/assistant/chat" asChild>
            <PrimaryButton title="Ouvrir la conversation" variant="ghost" style={styles.btn} />
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
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  block: { gap: spacing.sm, padding: spacing.lg },
  lead: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  cardLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '700' },
  cardValue: { ...typography.subtitle, color: colors.text, fontWeight: '800' },
  cardHint: { marginTop: spacing.sm, ...typography.caption, color: colors.textMuted },
  actions: { gap: spacing.md, marginTop: 'auto', paddingBottom: spacing.lg },
  btn: { width: '100%' },
});
