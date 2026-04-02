import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Dialog, Portal, Text } from 'react-native-paper';

import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { revolutPayUrlForTier } from '@/constants/revolutLinks';
import { SUBSCRIPTION_PLANS, type SubscriptionTierId } from '@/constants/subscriptionPlans';
import { colors, radius, spacing, surface } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useAssistantStore } from '@/stores/useAssistantStore';

export default function AssistantAbonnementScreen() {
  const setTier = useAssistantStore((s) => s.setTier);
  const [dialog, setDialog] = useState<{ title: string; body: string } | null>(null);

  async function pay(id: SubscriptionTierId) {
    const url = revolutPayUrlForTier(id);
    if (!url) {
      setDialog({
        title: 'Lien Revolut',
        body: 'Ajoute les URLs dans .env (EXPO_PUBLIC_REVOLUT_PAY_*) puis reconstruis.',
      });
      return;
    }
    if (!(await Linking.canOpenURL(url))) {
      setDialog({ title: 'URL invalide', body: url });
      return;
    }
    setTier(id);
    await Linking.openURL(url);
  }

  function tryLocal(id: SubscriptionTierId) {
    setTier(id);
  }

  return (
    <WestCoastBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="bodyMedium" style={styles.intro}>
          Trois prix · paiement par lien Revolut (configurable).
        </Text>

        {[...SUBSCRIPTION_PLANS]
          .sort((a, b) => (a.id === 'premium' ? -1 : b.id === 'premium' ? 1 : 0))
          .map((p) => (
            <Card
              key={p.id}
              mode="elevated"
              style={[surface.elevated, styles.card, p.id === 'premium' && styles.cardPremium]}
            >
              <Card.Content style={styles.cardInner}>
                <View style={styles.head}>
                  <View>
                    <Text variant="titleLarge" style={styles.name}>
                      {p.name}
                    </Text>
                    {p.id === 'premium' ? (
                      <Text variant="labelSmall" style={styles.reco}>
                        Recommandé
                      </Text>
                    ) : null}
                  </View>
                  <Text variant="headlineSmall" style={styles.price}>
                    {p.priceEur} €
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.tag}>
                  {p.tagline}
                </Text>
                {p.features.map((f) => (
                  <Text key={f} variant="bodyMedium" style={styles.feat}>
                    · {f}
                  </Text>
                ))}
                <PrimaryButton title="Payer (Revolut)" onPress={() => pay(p.id)} style={styles.btn} />
                <Pressable onPress={() => tryLocal(p.id)} hitSlop={8}>
                  <Text variant="bodySmall" style={styles.link}>
                    Utiliser ce forfait (test)
                  </Text>
                </Pressable>
              </Card.Content>
            </Card>
          ))}
      </ScrollView>
      <Portal>
        <Dialog visible={dialog !== null} onDismiss={() => setDialog(null)}>
          <Dialog.Title>{dialog?.title}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{dialog?.body}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </WestCoastBackground>
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
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderGlow,
  },
  cardInner: {
    gap: spacing.sm,
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
