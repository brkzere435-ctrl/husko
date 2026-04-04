import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeploymentHints } from '@/components/DeploymentHints';
import { OrderLinesPreview } from '@/components/OrderLinesPreview';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { GTAMiniMap } from '@/components/GTAMiniMap';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusBadge } from '@/components/StatusBadge';
import {
  AUTONOMOUS_PACE_PRESETS,
  estimatedMsUntilDelivered,
  formatEtaUntilDelivery,
} from '@/constants/autonomousDelivery';
import { CLIENT_PHONE_DISPLAY, CLIENT_PHONE_TEL, clientStrings } from '@/constants/clientExperience';
import { clientSuiviVisual } from '@/constants/clientSuiviVisual';
import { PENDING_VALIDATION_MS } from '@/constants/orderPolicy';
import { CLIENT_TIMELINE, timelineStepIndex } from '@/constants/orderFlow';
import { PAYMENT_NOTICE_SHORT } from '@/constants/paymentPolicy';
import { FONT } from '@/constants/fonts';
import { typography } from '@/constants/typography';
import { HUSKO_DEPARTURE_HUB } from '@/constants/huskoDepartureHub';
import { colors, elevation, radius, spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { formatEuro } from '@/utils/formatEuro';
import { fitMapRegion } from '@/utils/fitMapRegion';

export default function SuiviScreen() {
  const orders = useHuskoStore((s) => s.orders);
  const driver = useHuskoStore((s) => s.driver);
  const driverHeading = useHuskoStore((s) => s.driverHeading);
  const remoteAutonomousDemo = useHuskoStore((s) => s.remoteAutonomousDemo);
  const autonomousDemoEnabled = useHuskoStore((s) => s.autonomousDemoEnabled);
  const autonomousPacePreset = useHuskoStore((s) => s.autonomousPacePreset);

  const active = useMemo(
    () => orders.find((o) => o.status !== 'delivered' && o.status !== 'cancelled'),
    [orders]
  );

  /** Dernière commande (liste triée : plus récente en premier). */
  const latestOrder = orders[0];
  const showDeliveredThanks = !active && latestOrder?.status === 'delivered';
  const latestCancelled = !active && latestOrder?.status === 'cancelled' ? latestOrder : null;

  const stepIdx = active ? timelineStepIndex(active.status) : -1;

  const dest = active
    ? { latitude: active.destLat, longitude: active.destLng }
    : null;

  const showLiveMap = active?.status === 'on_way';
  const showStaticMap =
    !!active && active.status !== 'on_way' && active.status !== 'delivered' && active.status !== 'cancelled';

  const staticRegion = useMemo(() => {
    if (!active || !showStaticMap) return null;
    return fitMapRegion(
      [HUSKO_DEPARTURE_HUB, { latitude: active.destLat, longitude: active.destLng }],
      2
    );
  }, [active, showStaticMap]);

  const liveRegion = useMemo(() => {
    if (!active || !showLiveMap) return null;
    const pts = [HUSKO_DEPARTURE_HUB, { latitude: active.destLat, longitude: active.destLng }];
    if (driver) pts.push(driver);
    return fitMapRegion(pts, 1.85);
  }, [active, driver, showLiveMap]);


  const etaStepMs = useMemo(() => {
    if (remoteAutonomousDemo?.enabled) return remoteAutonomousDemo.stepMs;
    if (autonomousDemoEnabled) return AUTONOMOUS_PACE_PRESETS[autonomousPacePreset].stepMs;
    return null;
  }, [remoteAutonomousDemo, autonomousDemoEnabled, autonomousPacePreset]);

  const etaText = useMemo(() => {
    if (!active || etaStepMs == null) return null;
    const ms = estimatedMsUntilDelivered(active.status, etaStepMs);
    if (ms <= 0) return null;
    return formatEtaUntilDelivery(ms);
  }, [active, etaStepMs]);

  const etaClockLabel = useMemo(() => {
    if (!active || etaStepMs == null) return null;
    const ms = estimatedMsUntilDelivered(active.status, etaStepMs);
    if (ms <= 0) return null;
    const t = new Date(Date.now() + ms);
    return t.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }, [active, etaStepMs]);

  return (
    <WestCoastBackground preset="client">
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {active ? (
            <Animated.View entering={FadeIn.duration(340)}>
              <Card mode="elevated" style={styles.card}>
                <Card.Content style={styles.cardContent}>
              {etaClockLabel ? (
                <View style={styles.etaHero} accessibilityRole="summary">
                  <Text style={styles.etaHeroKicker}>Arrivée estimée</Text>
                  <Text style={styles.etaHeroTime}>{etaClockLabel}</Text>
                  {etaText ? <Text style={styles.etaHeroSub}>{etaText}</Text> : null}
                </View>
              ) : null}

              <View style={styles.stepperRow}>
                {CLIENT_TIMELINE.map((step, i) => {
                  const done = stepIdx > i;
                  const current = stepIdx === i;
                  return (
                    <View key={step.status} style={styles.stepperCell}>
                      <Ionicons
                        name={done || current ? 'flame' : 'flame-outline'}
                        size={current ? 26 : 20}
                        color={current ? WC.fire : done ? colors.gold : colors.textMuted}
                        style={current ? styles.stepperFlameHot : undefined}
                      />
                      <Text
                        style={[
                          styles.stepperLbl,
                          done && styles.stepperLblDone,
                          current && styles.stepperLblCurrent,
                        ]}
                        numberOfLines={2}
                      >
                        {step.label}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <Text style={typography.mono}>{active.id}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={active.status} />
              </View>
              <OrderLinesPreview lines={active.lines} />

              {active.status === 'pending' ? (
                <Text style={styles.pendingHint}>
                  En attente du gérant — validation sous {Math.round(PENDING_VALIDATION_MS / 60000)} min max,
                  sinon annulation automatique.
                </Text>
              ) : null}

              {etaText ? (
                <Text style={styles.etaLine}>
                  Temps estimé avant livraison : <Text style={styles.etaStrong}>{etaText}</Text>
                  {'\n'}
                  <Text style={typography.caption}>
                    (basé sur le rythme automatique défini par le gérant)
                  </Text>
                </Text>
              ) : active.status !== 'delivered' ? (
                <Text style={[typography.bodyMuted, styles.etaLine]}>
                  Délai habituel : 30–45 min selon la charge (indicatif).
                </Text>
              ) : null}

              <Text style={[typography.body, styles.addr]}>{active.addressLabel}</Text>
              <Text style={typography.price}>{formatEuro(active.total)}</Text>
              <Text style={[typography.caption, styles.pay]}>{PAYMENT_NOTICE_SHORT}</Text>

              {active.status === 'awaiting_livreur' ? (
                <Text style={[typography.bodyMuted, styles.mapHint]}>
                  Un livreur va bientôt prendre en charge votre commande. Dès qu’il est en route, la carte
                  passe en suivi live avec sa position.
                </Text>
              ) : null}

              {showStaticMap && staticRegion && dest ? (
                <View style={styles.mapWrap}>
                  <Text style={styles.mapTitle}>Aperçu du trajet</Text>
                  <Text style={styles.mapSub}>Du QG Husko à votre adresse — suivi live dès l’étape « En route »</Text>
                  <GTAMiniMap
                    region={staticRegion}
                    driver={null}
                    headingDeg={0}
                    dest={dest}
                    showDest
                    hudFooter="APERÇU · QG → DROP"
                  />
                </View>
              ) : null}

              {showLiveMap && liveRegion && dest ? (
                <View style={styles.mapWrap}>
                  <Text style={styles.mapTitle}>Suivi Cadillac · mode GTA</Text>
                  <Text style={styles.mapSub}>
                    QG bâtiment H (néon) · livraison en pin — le livreur roule vers toi
                  </Text>
                  <GTAMiniMap
                    region={liveRegion}
                    driver={driver}
                    headingDeg={driverHeading}
                    dest={dest}
                    showDest={!!dest}
                    hudFooter="LBC · DROP TOP · EN ROUTE"
                  />
                </View>
              ) : null}

              <View style={styles.contactStrip}>
                <Text style={styles.contactStripLbl}>HUSKO</Text>
                <Pressable
                  onPress={() => void Linking.openURL('https://snapchat.com/add/HUSKOBYNIGHT')}
                  style={styles.contactChip}
                >
                  <Ionicons name="logo-snapchat" size={18} color={WC.neonCyan} />
                  <Text style={styles.contactChipTxt}>HUSKOBYNIGHT</Text>
                </Pressable>
                <Pressable
                  onPress={() => void Linking.openURL(`tel:${CLIENT_PHONE_TEL}`)}
                  style={styles.contactChip}
                >
                  <Ionicons name="call" size={18} color={colors.gold} />
                  <Text style={styles.contactChipTxt}>{CLIENT_PHONE_DISPLAY}</Text>
                </Pressable>
              </View>
                </Card.Content>
              </Card>
            </Animated.View>
          ) : showDeliveredThanks ? (
            <Card mode="elevated" style={[styles.card, styles.merciCard, elevation.card]}>
              <Card.Content style={styles.cardContent}>
              <Text style={styles.merciTitle}>{clientStrings.suiviMerciTitle}</Text>
              <Text style={[typography.bodyMuted, styles.merciBody]}>{clientStrings.suiviMerciBody}</Text>
              <Text style={[typography.mono, styles.merciRef]}>{latestOrder?.id}</Text>
              <Link href="/client" asChild>
                <PrimaryButton title={clientStrings.suiviNewOrder} style={styles.merciBtn} />
              </Link>
              </Card.Content>
            </Card>
          ) : latestCancelled ? (
            <Card mode="elevated" style={[styles.card, styles.cancelCard, elevation.card]}>
              <Card.Content style={styles.cardContent}>
              <Text style={styles.cancelTitle}>{clientStrings.suiviCancelledTitle}</Text>
              <Text style={[typography.bodyMuted, styles.cancelBody]}>
                {clientStrings.suiviCancelledBody(latestCancelled.id)}
              </Text>
              <Link href="/client" asChild>
                <PrimaryButton title={clientStrings.suiviGoMenu} style={styles.merciBtn} />
              </Link>
              </Card.Content>
            </Card>
          ) : (
            <Card mode="elevated" style={[styles.card, styles.emptyCard, elevation.card]}>
              <Card.Content style={styles.cardContent}>
              <Text style={typography.title}>{clientStrings.suiviEmptyTitle}</Text>
              <Text style={[typography.bodyMuted, styles.emptyBody]}>{clientStrings.suiviEmptyBody}</Text>
              <Link href="/client" asChild>
                <PrimaryButton title={clientStrings.suiviGoMenu} style={styles.emptyBtn} />
              </Link>
              </Card.Content>
            </Card>
          )}
          {orders.some((o) => o.status === 'delivered' || o.status === 'cancelled') ? (
            <View style={styles.historiqueLinkWrap}>
              <Link href="/client/historique" asChild>
                <PrimaryButton title={clientStrings.historiqueLink} variant="ghost" />
              </Link>
            </View>
          ) : null}
          <DeploymentHints
            mode="alerts"
            mapsRelevant={showLiveMap || showStaticMap}
            style={styles.infra}
          />
        </ScrollView>
      </SafeAreaView>
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  emptyCard: { alignItems: 'stretch', gap: spacing.md },
  cancelCard: {
    alignItems: 'stretch',
    gap: spacing.sm,
    borderColor: clientSuiviVisual.cancelCardBorder,
  },
  cancelTitle: {
    ...typography.title,
    color: colors.posterRed,
    letterSpacing: 0.5,
  },
  cancelBody: { lineHeight: 22 },
  emptyBody: { marginTop: spacing.sm, lineHeight: 22 },
  emptyBtn: { marginTop: spacing.md },
  merciCard: {
    alignItems: 'stretch',
    gap: spacing.sm,
    borderColor: colors.borderGlow,
  },
  merciTitle: {
    ...typography.title,
    color: colors.gold,
    letterSpacing: 0.5,
  },
  merciBody: { lineHeight: 22 },
  merciRef: { color: colors.textMuted, marginTop: spacing.xs },
  merciBtn: { marginTop: spacing.md },
  card: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'visible',
  },
  cardContent: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  etaHero: {
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: clientSuiviVisual.etaHeroBg,
    borderWidth: 1,
    borderColor: clientSuiviVisual.etaHeroBorder,
    alignItems: 'center',
  },
  etaHeroKicker: {
    ...typography.caption,
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 2,
    color: clientSuiviVisual.etaHeroKicker,
    textTransform: 'uppercase',
  },
  etaHeroTime: {
    marginTop: spacing.xs,
    fontFamily: FONT.bold,
    fontSize: 40,
    color: colors.gold,
    fontVariant: ['tabular-nums'],
  },
  etaHeroSub: {
    marginTop: spacing.xs,
    ...typography.bodyMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  stepperRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  stepperCell: {
    flex: 1,
    minWidth: 56,
    alignItems: 'center',
    gap: 6,
  },
  stepperFlameHot: {
    shadowColor: WC.fire,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  stepperLbl: {
    fontFamily: FONT.medium,
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 12,
  },
  stepperLblDone: { color: colors.text },
  stepperLblCurrent: { color: WC.fire, fontFamily: FONT.bold, fontWeight: '800' },
  contactStrip: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
    gap: spacing.sm,
    alignItems: 'center',
  },
  contactStripLbl: {
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 3,
    color: clientSuiviVisual.contactStripLbl,
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: radius.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: clientSuiviVisual.contactChipBg,
  },
  contactChipTxt: {
    fontFamily: FONT.bold,
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  badgeRow: { marginTop: spacing.sm, marginBottom: spacing.sm },
  pendingHint: {
    marginBottom: spacing.md,
    color: WC.neonCyan,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: FONT.medium,
    fontWeight: '600',
  },
  etaLine: { marginBottom: spacing.md, color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  etaStrong: { color: colors.gold, fontFamily: FONT.bold, fontWeight: '800' },
  addr: { marginTop: spacing.xs },
  pay: { marginTop: spacing.md, fontStyle: 'italic' },
  mapHint: { marginTop: spacing.md },
  mapTitle: {
    ...typography.section,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
    alignSelf: 'stretch',
    textAlign: 'center',
    color: colors.gold,
    fontSize: 13,
    letterSpacing: 1.4,
  },
  mapSub: {
    fontFamily: FONT.medium,
    textAlign: 'center',
    color: WC.neonCyan,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: spacing.sm,
    opacity: 0.92,
  },
  mapWrap: {
    marginTop: spacing.lg,
    alignItems: 'center',
    minHeight: 180,
    width: '100%',
  },
  historiqueLinkWrap: { marginTop: spacing.md, marginBottom: spacing.sm },
  infra: { marginTop: spacing.lg },
});
