import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeploymentHints } from '@/components/DeploymentHints';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { GTAMiniMap } from '@/components/GTAMiniMap';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenSection } from '@/components/ScreenSection';
import { clientStrings, outsideDeliveryHoursBanner } from '@/constants/clientExperience';
import { isDeliveryOpen } from '@/constants/hours';
import { PAYMENT_NOTICE_LONG, PAYMENT_NOTICE_SHORT } from '@/constants/paymentPolicy';
import { typography } from '@/constants/typography';
import { colors, elevation, radius, spacing } from '@/constants/theme';
import { ANGERS_DEFAULT, useHuskoStore } from '@/stores/useHuskoStore';
import { hapticSuccess } from '@/utils/haptics';

export default function PanierScreen() {
  const cart = useHuskoStore((s) => s.cart);
  const clearCart = useHuskoStore((s) => s.clearCart);
  const placeOrder = useHuskoStore((s) => s.placeOrder);
  const driver = useHuskoStore((s) => s.driver);
  const driverHeading = useHuskoStore((s) => s.driverHeading);

  const [address, setAddress] = useState('Angers centre');

  const total = cart.reduce((a, l) => a + l.item.price * l.qty, 0);

  const region = {
    ...ANGERS_DEFAULT,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

  function checkout() {
    if (!cart.length) {
      Alert.alert('Panier vide', 'Ajoutez des articles depuis le menu.');
      return;
    }
    const order = placeOrder(address.trim() || 'Adresse', ANGERS_DEFAULT);
    if (order) {
      hapticSuccess();
      Alert.alert(
        clientStrings.orderSentTitle,
        `${clientStrings.orderSentMessage(order.id)}\n\n${PAYMENT_NOTICE_SHORT}`,
        [{ text: 'Voir le suivi', onPress: () => router.replace('/client/suivi') }]
      );
    }
  }

  return (
    <WestCoastBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {cart.length > 0 ? (
            <>
              <Text style={[typography.bodyMuted, styles.intro]}>{clientStrings.panierIntro}</Text>
              {!isDeliveryOpen() ? (
                <View style={styles.outsideBanner}>
                  <Text style={styles.outsideBannerTitle}>Hors créneau livraison</Text>
                  <Text style={styles.outsideBannerBody}>{outsideDeliveryHoursBanner}</Text>
                </View>
              ) : null}
            </>
          ) : null}
          <View style={styles.mapRow}>
            <GTAMiniMap
              region={region}
              driver={driver}
              headingDeg={driverHeading}
              dest={ANGERS_DEFAULT}
              showDest
              hudFooter="PREVIEW MAP · ANGERS"
            />
            <View style={styles.mapLegend}>
              <Text style={typography.bodyMuted}>Aperçu carte & livreur (même appareil).</Text>
            </View>
          </View>

          <ScreenSection title="Adresse">
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Rue, code postal, ville"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </ScreenSection>

          <ScreenSection title="Récapitulatif">
            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <Text style={typography.body}>{clientStrings.panierEmptyTitle}</Text>
                <Text style={[typography.bodyMuted, styles.emptyCartBody]}>
                  {clientStrings.panierEmptyBody}
                </Text>
                <Link href="/client" asChild>
                  <PrimaryButton title="Retour au menu" style={styles.emptyCartBtn} />
                </Link>
              </View>
            ) : (
              cart.map((line) => (
                <View key={line.item.id} style={styles.line}>
                  <Text style={typography.body}>
                    {line.item.name} × {line.qty}
                  </Text>
                  <Text style={typography.price}>
                    {(line.item.price * line.qty).toFixed(2)} €
                  </Text>
                </View>
              ))
            )}
          </ScreenSection>

          <View style={styles.totalRow}>
            <Text style={typography.title}>Total</Text>
            <Text style={[typography.price, styles.totalBig]}>{total.toFixed(2)} €</Text>
          </View>

          <View style={styles.paymentBox}>
            <Text style={typography.section}>Paiement</Text>
            <Text style={[typography.bodyMuted, styles.paymentText]}>{PAYMENT_NOTICE_LONG}</Text>
          </View>

          <PrimaryButton title="Valider la commande" onPress={checkout} />
          <PrimaryButton title="Vider le panier" variant="ghost" onPress={() => clearCart()} />

          <DeploymentHints mode="alerts" mapsRelevant style={styles.infra} />
        </ScrollView>
      </SafeAreaView>
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  intro: { marginBottom: spacing.md, fontSize: 14, lineHeight: 21 },
  outsideBanner: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.45)',
  },
  outsideBannerTitle: {
    color: '#67e8f9',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  outsideBannerBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  emptyCart: { gap: spacing.md, paddingVertical: spacing.sm },
  emptyCartBody: { lineHeight: 20 },
  emptyCartBtn: { marginTop: spacing.sm },
  infra: { marginTop: spacing.lg },
  mapRow: { flexDirection: 'row', marginBottom: spacing.lg, alignItems: 'flex-start', gap: spacing.md },
  mapLegend: { flex: 1, justifyContent: 'center' },
  input: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    color: colors.text,
    padding: spacing.md,
    fontSize: 16,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  totalBig: { fontSize: 26 },
  paymentBox: {
    backgroundColor: colors.glass,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...elevation.card,
  },
  paymentText: { marginTop: spacing.sm },
});
