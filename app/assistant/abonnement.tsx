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
        'Lien Revolut manquant',
        `Définis la variable d'environnement pour ce forfait (voir env.example), puis reconstruis l'APK.`,
      );
      return;
    }
    const ok = await Linking.canOpenURL(url);
    if (!ok) {
      Alert.alert('URL invalide', url);
      return;
    }
    setTier(id);
    await Linking.openURL(url);
  }

  function selectLocalOnly(id: SubscriptionTierId) {
    setTier(id);
    Alert.alert('Forfait enregistré localement', 'Pense à valider le paiement côté Revolut / webhook.');
  }

  return (
    <HuskoBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>
          Forfait conseillé : Premium 180 € (pleine fonctionnalité). Essentiel 50 € et Pro 100 €
          restent disponibles. Paiement via tes liens Revolut Merchant.
        </Text>

        {[...SUBSCRIPTION_PLANS].sort((a, b) => (a.id === 'premium' ? -1 : b.id === 'premium' ? 1 : 0)).map((p) => (
          <View
            key={p.id}
            style={[surface.elevated, styles.card, p.id === 'premium' && styles.cardPremium]}
          >
            <View style={styles.cardHead}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{p.name}</Text>
                {p.id === 'premium' ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeTxt}>Choix conseillé</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.price}>{p.priceEur} €</Text>
            </View>
            <Text style={styles.tag}>{p.tagline}</Text>
            <View style={styles.list}>
              {p.features.map((f) => (
                <Text key={f} style={styles.feat}>
                  · {f}
                </Text>
              ))}
            </View>
            <PrimaryButton title="Payer avec Revolut" onPress={() => pay(p.id)} style={styles.btn} />
            <Pressable onPress={() => selectLocalOnly(p.id)} style={styles.secondary}>
              <Text style={styles.secondaryTxt}>Enregistrer ce forfait (test sans lien)</Text>
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
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    backgroundColor: colors.glass,
  },
  cardPremium: {
    borderColor: colors.gold,
    borderWidth: 2,
    backgroundColor: 'rgba(240, 208, 80, 0.08)',
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  nameRow: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  name: { ...typography.title, fontSize: 20 },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(240, 208, 80, 0.2)',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  badgeTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  price: { ...typography.title, color: colors.gold, fontSize: 22 },
  tag: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  list: { gap: spacing.xs, marginTop: spacing.sm },
  feat: { ...typography.body, color: colors.text, fontSize: 14, lineHeight: 20 },
  btn: { width: '100%', marginTop: spacing.md },
  secondary: { alignSelf: 'center', paddingVertical: spacing.sm },
  secondaryTxt: { ...typography.caption, color: colors.gold, fontWeight: '700' },
});
