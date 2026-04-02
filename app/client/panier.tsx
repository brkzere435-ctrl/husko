import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Text, TextInput } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeploymentHints } from '@/components/DeploymentHints';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';
import { GTAMiniMap } from '@/components/GTAMiniMap';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenSection } from '@/components/ScreenSection';
import { clientStrings, outsideDeliveryHoursBanner } from '@/constants/clientExperience';
import { isDeliveryOpen } from '@/constants/hours';
import { PAYMENT_NOTICE_LONG, PAYMENT_NOTICE_SHORT } from '@/constants/paymentPolicy';
import { typography } from '@/constants/typography';
import { colors, elevation, radius, spacing } from '@/constants/theme';
import { HUSKO_DEPARTURE_HUB } from '@/constants/huskoDepartureHub';
import { ANGERS_DEFAULT, useHuskoStore } from '@/stores/useHuskoStore';
import { fitMapRegion } from '@/utils/fitMapRegion';
import { hapticSuccess } from '@/utils/haptics';

export default function PanierScreen() {
  const cart = useHuskoStore((s) => s.cart);
  const clearCart = useHuskoStore((s) => s.clearCart);
  const placeOrder = useHuskoStore((s) => s.placeOrder);
  const driver = useHuskoStore((s) => s.driver);
  const driverHeading = useHuskoStore((s) => s.driverHeading);

  const [address, setAddress] = useState('Angers centre');
  const [dialog, setDialog] = useState<
    | { type: 'empty' }
    | { type: 'cloud' }
    | { type: 'success'; orderId: string }
    | null
  >(null);

  const total = cart.reduce((a, l) => a + l.item.price * l.qty, 0);
  const cloudOk = isRemoteSyncEnabled();

  const region = useMemo(
    () => fitMapRegion([ANGERS_DEFAULT, HUSKO_DEPARTURE_HUB], 2),
    []
  );

  function checkout() {
    if (!cart.length) {
      setDialog({ type: 'empty' });
      return;
    }
    if (!isRemoteSyncEnabled()) {
      setDialog({ type: 'cloud' });
      return;
    }
    const order = placeOrder(address.trim() || 'Adresse', ANGERS_DEFAULT);
    if (order) {
      hapticSuccess();
      setDialog({ type: 'success', orderId: order.id });
    }
  }

  return (
    <WestCoastBackground preset="client">
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
              {!cloudOk ? (
                <View style={styles.cloudBanner}>
                  <Text style={styles.cloudBannerTitle}>Liaison cloud inactive</Text>
                  <Text style={[typography.bodyMuted, styles.cloudBannerBody]}>
                    Le gérant ne recevra pas la commande sur un autre appareil tant que Firebase n’est pas
                    configuré au build (EAS). Voir App & mises à jour.
                  </Text>
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
              <Text style={typography.bodyMuted}>
                QG Husko : bâtiment en H (néon) · pin rouge = adresse de livraison · lowrider = livreur.
              </Text>
            </View>
          </View>

          <ScreenSection title="Adresse">
            <TextInput
              mode="outlined"
              value={address}
              onChangeText={setAddress}
              placeholder="Rue, code postal, ville"
              placeholderTextColor={colors.textMuted}
              textColor={colors.text}
              outlineColor={colors.borderSubtle}
              activeOutlineColor={colors.accent}
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

          <LinearGradient
            colors={['rgba(55, 10, 20, 0.96)', 'rgba(12, 6, 10, 0.98)', 'rgba(8, 24, 36, 0.94)']}
            locations={[0, 0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.totalRow}
          >
            <View style={styles.totalRowInner}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={[typography.price, styles.totalBig]}>{total.toFixed(2)} €</Text>
            </View>
          </LinearGradient>

          <View style={styles.paymentBox}>
            <Text style={typography.section}>Paiement</Text>
            <Text style={[typography.bodyMuted, styles.paymentText]}>{PAYMENT_NOTICE_LONG}</Text>
          </View>

          {cart.length > 0 ? (
            <Animated.View entering={FadeIn.duration(360)} style={styles.ctaBlock}>
              <PrimaryButton title="Valider la commande" onPress={checkout} />
              <PrimaryButton title="Vider le panier" variant="ghost" onPress={() => clearCart()} />
            </Animated.View>
          ) : null}

          <DeploymentHints mode="alerts" mapsRelevant style={styles.infra} />
        </ScrollView>

        <Portal>
          <Dialog visible={dialog !== null} onDismiss={() => setDialog(null)}>
            {dialog?.type === 'empty' ? (
              <>
                <Dialog.Title>Panier vide</Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium">Ajoutez des articles depuis le menu.</Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setDialog(null)}>OK</Button>
                </Dialog.Actions>
              </>
            ) : null}
            {dialog?.type === 'cloud' ? (
              <>
                <Dialog.Title>{clientStrings.cloudCheckoutBlockedTitle}</Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium">{clientStrings.cloudCheckoutBlockedBody}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setDialog(null)}>OK</Button>
                </Dialog.Actions>
              </>
            ) : null}
            {dialog?.type === 'success' ? (
              <>
                <Dialog.Title>{clientStrings.orderSentTitle}</Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium">
                    {`${clientStrings.orderSentMessage(dialog.orderId)}\n\n${PAYMENT_NOTICE_SHORT}`}
                  </Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setDialog(null)}>Fermer</Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      setDialog(null);
                      router.replace('/client/suivi');
                    }}
                  >
                    Voir le suivi
                  </Button>
                </Dialog.Actions>
              </>
            ) : null}
          </Dialog>
        </Portal>
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
  cloudBanner: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(250, 204, 21, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.45)',
  },
  cloudBannerTitle: {
    color: colors.gold,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  cloudBannerBody: {
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
    marginTop: spacing.xs,
    backgroundColor: colors.cardElevated,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  totalRow: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.22)',
    overflow: 'hidden',
    ...elevation.card,
  },
  totalRowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  totalLabel: {
    ...typography.title,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  totalBig: { fontSize: 28 },
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
  ctaBlock: { gap: spacing.sm, marginBottom: spacing.sm },
});
