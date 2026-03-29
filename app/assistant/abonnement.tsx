import * as Linking from 'expo-linking';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HuskoBackground } from '@/components/HuskoBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { revolutPayUrlForTier } from '@/constants/revolutLinks';
import { SUBSCRIPTION_PLANS, type SubscriptionTierId } from '@/constants/subscriptionPlans';
import { colors, radius, spacing } from '@/constants/theme';
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
          Trois niveaux : Essentiel 50 €, Pro 100 €, Premium 180 €. Le paiement se fait via tes liens
          Revolut Merchant ; l’app n’embarque aucun secret.
        </Text>

        {SUBSCRIPTION_PLANS.map((p) => (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.name}>{p.name}</Text>
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
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    backgroundColor: colors.glass,
    gap: spacing.sm,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  name: { ...typography.title, fontSize: 20 },
  price: { ...typography.title, color: colors.gold, fontSize: 22 },
  tag: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  list: { gap: spacing.xs, marginTop: spacing.sm },
  feat: { ...typography.body, color: colors.text, fontSize: 14, lineHeight: 20 },
  btn: { width: '100%', marginTop: spacing.md },
  secondary: { alignSelf: 'center', paddingVertical: spacing.sm },
  secondaryTxt: { ...typography.caption, color: colors.gold, fontWeight: '700' },
});
