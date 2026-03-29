import * as Linking from 'expo-linking';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HuskoBackground } from '@/components/HuskoBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { revolutPayUrlForTier } from '@/constants/revolutLinks';
import { SUBSCRIPTION_PLANS, type SubscriptionTierId } from '@/constants/subscriptionPlans';
import { colors, radius, spacing, surface } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useAssistantStore } from '@/stores/useAssistantStore';

export default function AssistantAbonnementScreen() {
  const setTier = useAssistantStore((s) => s.setTier);

  async function pay(id: SubscriptionTierId) {
    const url = revolutPayUrlForTier(id);
    if (!url) {
      Alert.alert(
        'Lien Revolut',
        'Ajoute les URLs dans .env (EXPO_PUBLIC_REVOLUT_PAY_*) puis reconstruis.',
      );
      return;
    }
    if (!(await Linking.canOpenURL(url))) {
      Alert.alert('URL invalide', url);
      return;
    }
    setTier(id);
    await Linking.openURL(url);
  }

  function tryLocal(id: SubscriptionTierId) {
    setTier(id);
  }

  return (
    <HuskoBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>Trois prix · paiement par lien Revolut (configurable).</Text>

        {[...SUBSCRIPTION_PLANS]
          .sort((a, b) => (a.id === 'premium' ? -1 : b.id === 'premium' ? 1 : 0))
          .map((p) => (
            <View
              key={p.id}
              style={[surface.elevated, styles.card, p.id === 'premium' && styles.cardPremium]}
            >
              <View style={styles.head}>
                <View>
                  <Text style={styles.name}>{p.name}</Text>
                  {p.id === 'premium' ? (
                    <Text style={styles.reco}>Recommandé</Text>
                  ) : null}
                </View>
                <Text style={styles.price}>{p.priceEur} €</Text>
              </View>
              <Text style={styles.tag}>{p.tagline}</Text>
              {p.features.map((f) => (
                <Text key={f} style={styles.feat}>
                  · {f}
                </Text>
              ))}
              <PrimaryButton title="Payer (Revolut)" onPress={() => pay(p.id)} style={styles.btn} />
              <Pressable onPress={() => tryLocal(p.id)} hitSlop={8}>
                <Text style={styles.link}>Utiliser ce forfait (test)</Text>
              </Pressable>
            </View>
          ))}
      </ScrollView>
    </HuskoBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  intro: {
    ...typography.bodyMuted,
    marginBottom: spacing.xs,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderGlow,
  },
  cardPremium: {
    borderColor: colors.gold,
    borderWidth: 2,
    backgroundColor: 'rgba(240, 208, 80, 0.06)',
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: { ...typography.title, fontSize: 20 },
  reco: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '800',
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  price: { ...typography.title, color: colors.gold, fontSize: 24 },
  tag: { ...typography.caption, color: colors.textMuted },
  feat: { ...typography.body, fontSize: 14, color: colors.text, lineHeight: 20 },
  btn: { width: '100%', marginTop: spacing.sm },
  link: {
    alignSelf: 'center',
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});
