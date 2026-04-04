import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
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
import { FONT } from '@/constants/fonts';
import { typography } from '@/constants/typography';
import { colors, elevation, radius, spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';
import { HUSKO_DEPARTURE_HUB } from '@/constants/huskoDepartureHub';
import { openTechnicalFeedback } from '@/navigation/openTechnicalFeedback';
import { ANGERS_DEFAULT, useHuskoStore } from '@/stores/useHuskoStore';
import { formatCloudSyncErrorForUser } from '@/utils/cloudSyncUserMessage';
import { formatEuro } from '@/utils/formatEuro';
import { fitMapRegion } from '@/utils/fitMapRegion';
import { hapticSuccess } from '@/utils/haptics';

/** Sous cette largeur (dp), carte GTA + légende passent en colonne pour éviter l’étirement horizontal. */
const MAP_STACK_BREAKPOINT = 420;

export default function PanierScreen() {
  const { width: windowW } = useWindowDimensions();
  const mapStackVertical = windowW < MAP_STACK_BREAKPOINT;

  const cart = useHuskoStore((s) => s.cart);
  const clearCart = useHuskoStore((s) => s.clearCart);
  const placeOrder = useHuskoStore((s) => s.placeOrder);
  const cloudSyncWriteError = useHuskoStore((s) => s.cloudSyncWriteError);
  const driver = useHuskoStore((s) => s.driver);
  const driverHeading = useHuskoStore((s) => s.driverHeading);

  const [address, setAddress] = useState('Angers centre');
  const [dialog, setDialog] = useState<
    | { type: 'empty' }
    | { type: 'cloud' }
    | { type: 'success'; orderId: string }
    | { type: 'pushFailed' }
    | null
  >(null);
  const [submitting, setSubmitting] = useState(false);

  const total = cart.reduce((a, l) => a + l.item.price * l.qty, 0);
  const cloudOk = isRemoteSyncEnabled();

  const region = useMemo(
    () => fitMapRegion([ANGERS_DEFAULT, HUSKO_DEPARTURE_HUB], 2),
    []
  );

  async function checkout() {
    if (!cart.length) {
      setDialog({ type: 'empty' });
      return;
    }
    if (!isRemoteSyncEnabled()) {
      setDialog({ type: 'cloud' });
      return;
    }
    setSubmitting(true);
    try {
      const order = await placeOrder(address.trim() || 'Adresse', ANGERS_DEFAULT);
      if (order) {
        hapticSuccess();
        setDialog({ type: 'success', orderId: order.id });
      }
    } catch {
      setDialog({ type: 'pushFailed' });
    } finally {
      setSubmitting(false);
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
                  <Text style={styles.cloudBannerTitle}>Envoi vers le restaurant</Text>
                  <Text style={[typography.bodyMuted, styles.cloudBannerBody]}>
                    Cette installation ne transmet pas les commandes aux autres appareils du restaurant. La
                    commande reste visible sur ce téléphone. Pour la caisse / cuisine sur un autre
                    téléphone, utilisez la version fournie par l’équipe (voir aussi App & mises à jour).
                  </Text>
                </View>
              ) : null}
            </>
          ) : null}

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
                  <Text style={[typography.body, styles.lineName]} numberOfLines={4}>
                    {line.item.name} × {line.qty}
                  </Text>
                  <Text style={[typography.price, styles.linePrice]}>{formatEuro(line.item.price * line.qty)}</Text>
                </View>
              ))
            )}
          </ScreenSection>

          <ScreenSection title="Aperçu zone">
            <View style={[styles.mapRow, mapStackVertical && styles.mapRowStack]}>
              <GTAMiniMap
                region={region}
                driver={driver}
                headingDeg={driverHeading}
                dest={ANGERS_DEFAULT}
                showDest
                hudFooter="APERÇU · ANGERS"
              />
              <View style={[styles.mapLegend, mapStackVertical && styles.mapLegendStacked]}>
                <Text style={typography.caption}>
                  QG (néon) · pin = livraison · véhicule = livreur si suivi actif.
                </Text>
              </View>
            </View>
          </ScreenSection>

          <LinearGradient
            colors={[
              'rgba(45, 31, 53, 0.96)',
              'rgba(30, 22, 28, 0.98)',
              'rgba(30, 24, 32, 0.94)',
            ]}
            locations={[0, 0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.totalRow}
          >
            <View style={styles.totalRowInner}>
              <Text style={[styles.totalLabel, styles.totalLabelShrink]}>Total</Text>
              <Text style={[typography.price, styles.totalBig, styles.totalAmount]}>{formatEuro(total)}</Text>
            </View>
          </LinearGradient>

          <View style={styles.paymentBox}>
            <Text style={typography.section}>Paiement</Text>
            <Text style={[typography.bodyMuted, styles.paymentText]}>{PAYMENT_NOTICE_LONG}</Text>
          </View>

          {cart.length > 0 ? (
            <Animated.View entering={FadeIn.duration(360)} style={styles.ctaBlock}>
              <PrimaryButton
                title={submitting ? 'Envoi en cours…' : 'Valider la commande'}
                onPress={() => void checkout()}
                disabled={submitting}
              />
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
            {dialog?.type === 'pushFailed' ? (
              <>
                <Dialog.Title>Envoi incomplet</Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyMedium">
                    La commande est enregistrée sur cet appareil, mais la synchronisation avec le restaurant
                    a échoué après plusieurs essais. Vérifiez le réseau, puis réessayez depuis le suivi ou
                    contactez le restaurant.
                  </Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setDialog(null)}>OK</Button>
                  <Button
                    onPress={() => {
                      const detail = cloudSyncWriteError?.trim() || undefined;
                      const body =
                        formatCloudSyncErrorForUser(detail ?? null) ??
                        'La synchronisation avec le restaurant a échoué après plusieurs essais.';
                      setDialog(null);
                      openTechnicalFeedback({
                        title: 'Envoi vers le restaurant',
                        body,
                        detail,
                      });
                    }}
                  >
                    Détail technique
                  </Button>
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
    backgroundColor: 'rgba(94, 234, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.38)',
  },
  outsideBannerTitle: {
    ...typography.section,
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    color: WC.neonCyan,
  },
  outsideBannerBody: {
    fontFamily: FONT.medium,
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
    ...typography.section,
    fontSize: 13,
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    color: colors.gold,
  },
  cloudBannerBody: {
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  emptyCart: { gap: spacing.md, paddingVertical: spacing.sm },
  emptyCartBody: { lineHeight: 20 },
  emptyCartBtn: { marginTop: spacing.sm },
  infra: { marginTop: spacing.lg },
  mapRow: { flexDirection: 'row', marginBottom: spacing.lg, alignItems: 'flex-start', gap: spacing.md },
  mapRowStack: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.md,
  },
  mapLegend: { flex: 1, minWidth: 0, justifyContent: 'center' },
  mapLegendStacked: {
    flex: 0,
    flexGrow: 0,
    alignSelf: 'stretch',
    width: '100%',
  },
  input: {
    marginTop: spacing.xs,
    backgroundColor: colors.cardElevated,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  lineName: { flex: 1, minWidth: 0 },
  linePrice: { flexShrink: 0 },
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
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  totalLabel: {
    ...typography.title,
    fontFamily: FONT.bold,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  totalLabelShrink: { flex: 1, minWidth: 0 },
  totalBig: { fontSize: 28, fontFamily: FONT.bold },
  totalAmount: { flexShrink: 0 },
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
