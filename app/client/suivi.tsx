import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Link } from 'expo-router';
import { memo, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeploymentHints } from '@/components/DeploymentHints';
import { GTAMiniMap } from '@/components/GTAMiniMap';
import { OrderLinesPreview } from '@/components/OrderLinesPreview';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusBadge } from '@/components/StatusBadge';
import {
  AUTONOMOUS_PACE_PRESETS,
  estimatedMsUntilDelivered,
  formatEtaUntilDelivery,
} from '@/constants/autonomousDelivery';
import {
  CLIENT_PHONE_DISPLAY,
  CLIENT_PHONE_TEL,
  CLIENT_SNAP_ADD_URL,
  clientStrings,
} from '@/constants/clientExperience';
import { clientSuiviVisual } from '@/constants/clientSuiviVisual';
import { PENDING_VALIDATION_MS } from '@/constants/orderPolicy';
import { CLIENT_TIMELINE, timelineStepIndex } from '@/constants/orderFlow';
import { PAYMENT_NOTICE_SHORT } from '@/constants/paymentPolicy';
import { FONT } from '@/constants/fonts';
import { typography } from '@/constants/typography';
import { HUSKO_DEPARTURE_HUB } from '@/constants/huskoDepartureHub';
import { colors, elevation, radius, spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';
import { pickPrimaryActiveOrder, useHuskoStore } from '@/stores/useHuskoStore';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';
import { formatEuro } from '@/utils/formatEuro';
import { formatDriverPositionAgeFr } from '@/utils/formatDriverPositionAge';
import { fitMapRegion } from '@/utils/fitMapRegion';

const DRIVER_SIGNAL_STALE_MS = 120_000;

type MiniMapCanvasProps = {
  mapSize: number;
  mapRegion: Parameters<typeof GTAMiniMap>[0]['region'];
  driver: Parameters<typeof GTAMiniMap>[0]['driver'];
  driverHeading: number;
  dest: Parameters<typeof GTAMiniMap>[0]['dest'];
  mapHudFooter: string;
  mapAccessibilityLabel: string;
};

const MiniMapCanvas = memo(function MiniMapCanvas({
  mapSize,
  mapRegion,
  driver,
  driverHeading,
  dest,
  mapHudFooter,
  mapAccessibilityLabel,
}: MiniMapCanvasProps) {
  return (
    <View style={styles.mapNeonOuter} accessibilityRole="image" accessibilityLabel={mapAccessibilityLabel}>
      <GTAMiniMap
        size={mapSize}
        region={mapRegion}
        driver={driver}
        headingDeg={driverHeading}
        dest={dest}
        showDest={!!dest}
        hudFooter={mapHudFooter}
      />
    </View>
  );
});

export default function SuiviScreen() {
  const { width: windowW } = useWindowDimensions();
  const mapSize = Math.min(288, Math.max(220, windowW - spacing.md * 2 - spacing.lg * 2));
  const compactMapUi = windowW < 372;
  const [nowMs, setNowMs] = useState(() => Date.now());

  const orders = useHuskoStore((s) => s.orders);
  const cloudSyncListenError = useHuskoStore((s) => s.cloudSyncListenError);
  const driver = useHuskoStore((s) => s.driver);
  const driverHeading = useHuskoStore((s) => s.driverHeading);
  const driverPositionUpdatedAt = useHuskoStore((s) => s.driverPositionUpdatedAt);
  const remoteAutonomousDemo = useHuskoStore((s) => s.remoteAutonomousDemo);
  const autonomousDemoEnabled = useHuskoStore((s) => s.autonomousDemoEnabled);
  const autonomousPacePreset = useHuskoStore((s) => s.autonomousPacePreset);

  const active = useMemo(() => pickPrimaryActiveOrder(orders), [orders]);

  /** Dernière commande (liste triée : plus récente en premier). */
  const latestOrder = orders[0];
  const showDeliveredThanks = !active && latestOrder?.status === 'delivered';
  const latestCancelled = !active && latestOrder?.status === 'cancelled' ? latestOrder : null;

  const stepIdx = active ? timelineStepIndex(active.status) : -1;

  const dest = useMemo(() => {
    if (!active) return null;
    const hasDestCoords =
      Number.isFinite(active.destLat) &&
      Number.isFinite(active.destLng) &&
      !(active.destLat === 0 && active.destLng === 0);
    return hasDestCoords ? { latitude: active.destLat, longitude: active.destLng } : null;
  }, [active]);

  const remoteOk = isRemoteSyncEnabled();
  const driverDot = driver;
  const driverSignalAgeMs =
    driverPositionUpdatedAt == null ? null : Math.max(0, nowMs - driverPositionUpdatedAt);
  const hasReliableDriverSignal =
    !!driverDot && driverSignalAgeMs != null && driverSignalAgeMs <= DRIVER_SIGNAL_STALE_MS;

  /** Ne pas étiqueter « live » sans point GPS réel — évite le ressenti « faux suivi ». */
  const mapTruth = useMemo(() => {
    if (!active || active.status === 'delivered' || active.status === 'cancelled') return 'preview' as const;
    if (hasReliableDriverSignal && (active.status === 'on_way' || active.status === 'awaiting_livreur')) {
      return 'live' as const;
    }
    if (active.status === 'on_way') return 'en_route_no_fix' as const;
    return 'preview' as const;
  }, [active, hasReliableDriverSignal]);
  const showLiveMap =
    !!active && active.status !== 'delivered' && active.status !== 'cancelled' && mapTruth === 'live';
  const showStaticMap =
    !!active && !showLiveMap && active.status !== 'delivered' && active.status !== 'cancelled';

  const staticRegion = useMemo(() => {
    if (!active || !showStaticMap) return null;
    const pts = [HUSKO_DEPARTURE_HUB];
    if (dest) pts.push(dest);
    if (driver) pts.push(driver);
    return fitMapRegion(pts, 2);
  }, [active, showStaticMap, dest, driver]);

  const liveRegion = useMemo(() => {
    if (!active || !showLiveMap) return null;
    const pts = [HUSKO_DEPARTURE_HUB];
    if (dest) pts.push(dest);
    if (driver) pts.push(driver);
    return fitMapRegion(pts, 1.85);
  }, [active, driver, showLiveMap, dest]);

  const fallbackMapRegion = useMemo(() => {
    const pts = [HUSKO_DEPARTURE_HUB];
    if (driver) pts.push(driver);
    return fitMapRegion(pts, 2);
  }, [driver]);
  const mapRegion = liveRegion ?? staticRegion ?? fallbackMapRegion;
  const mapKicker =
    mapTruth === 'live'
      ? 'LIVE'
      : mapTruth === 'en_route_no_fix'
        ? 'EN ROUTE'
        : 'TRAJET';
  const mapTitle =
    mapTruth === 'live'
      ? 'Livreur localisé'
      : mapTruth === 'en_route_no_fix'
        ? 'En route · signal GPS attendu'
        : 'Trajet prévu';
  const mapSub =
    mapTruth === 'live'
      ? dest
        ? 'Position reçue · QG vers ta livraison'
        : 'Position reçue · adresse de livraison à confirmer'
      : mapTruth === 'en_route_no_fix'
        ? remoteOk
          ? driverDot && driverSignalAgeMs != null && driverSignalAgeMs > DRIVER_SIGNAL_STALE_MS
            ? 'Dernier signal trop ancien · attente d’une nouvelle position.'
            : 'Le point apparaît dès qu’un GPS livreur fiable est reçu.'
          : 'Pas de liaison cloud sur ce téléphone · suivi temps réel indisponible.'
        : dest
          ? 'QG Husko vers ton adresse · le live démarre en route.'
          : 'Le trajet complet s’affiche dès que l’adresse est confirmée.';
  const mapHudFooter =
    mapTruth === 'live' ? 'HUSKO · SUIVI LIVE' : mapTruth === 'en_route_no_fix' ? 'EN ROUTE · GPS' : 'APERÇU PARCOURS';
  const driverPositionLabel = useMemo(() => {
    if (!driverDot || (mapTruth !== 'live' && mapTruth !== 'en_route_no_fix')) return null;
    if (driverPositionUpdatedAt == null) {
      return 'Dernière position : heure non dispo';
    }
    return `Dernière position : ${formatDriverPositionAgeFr(driverPositionUpdatedAt, nowMs)}`;
  }, [driverDot, driverPositionUpdatedAt, mapTruth, nowMs]);
  const driverSignalTone = useMemo(() => {
    if (!driverDot || driverPositionUpdatedAt == null) return null;
    const ageSec = Math.max(0, Math.round((nowMs - driverPositionUpdatedAt) / 1000));
    if (ageSec <= 45) return 'fresh' as const;
    if (ageSec <= Math.round(DRIVER_SIGNAL_STALE_MS / 1000)) return 'aging' as const;
    return 'old' as const;
  }, [driverDot, driverPositionUpdatedAt, nowMs]);
  const signalUi = useMemo(() => {
    if (!driverSignalTone) return null;
    if (driverSignalTone === 'fresh') {
      return {
        label: 'Signal GPS OK',
        icon: 'radio' as const,
        iconColor: colors.gold,
        style: styles.signalChipFresh,
      };
    }
    if (driverSignalTone === 'aging') {
      return {
        label: 'Signal GPS moyen',
        icon: 'radio' as const,
        iconColor: colors.gold,
        style: styles.signalChipAging,
      };
    }
    return {
      label: 'Signal GPS faible',
      icon: 'warning' as const,
      iconColor: colors.posterRed,
      style: styles.signalChipOld,
    };
  }, [driverSignalTone]);
  const mapAccessibilityLabel = useMemo(() => {
    if (mapTruth === 'live') {
      return 'Carte : QG, position livreur et adresse de livraison';
    }
    if (mapTruth === 'en_route_no_fix') {
      return 'Carte : trajet sans position livreur pour l’instant';
    }
    return 'Aperçu de carte : QG Husko et trajet';
  }, [mapTruth]);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 30_000);
    return () => {
      clearInterval(timer);
    };
  }, []);

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
                  {remoteAutonomousDemo?.enabled || autonomousDemoEnabled ? (
                    <Text style={styles.etaDemoHint}>Indicatif automatique (rythme de démo / cuisine)</Text>
                  ) : null}
                </View>
              ) : null}

              {!remoteOk ? (
                <View style={styles.syncBanner} accessibilityRole="alert">
                  <View style={styles.syncBannerHead}>
                    <Ionicons name="cloud-offline" size={15} color={WC.neonOrange} />
                    <Text style={styles.syncBannerTitle}>Pas de liaison en ligne</Text>
                  </View>
                  <Text style={styles.syncBannerBody}>
                    Les commandes et le GPS ne se synchronisent pas avec le restaurant sur cette
                    installation. Le suivi « comme en vrai » nécessite la même config Firebase que les
                    autres apps Husko (voir l’équipe ou les réglages si disponibles).
                  </Text>
                </View>
              ) : null}
              {remoteOk && cloudSyncListenError ? (
                <View style={[styles.syncBanner, styles.syncBannerError]} accessibilityRole="alert">
                  <View style={styles.syncBannerHead}>
                    <Ionicons name="alert-circle" size={15} color={colors.posterRed} />
                    <Text style={styles.syncBannerTitle}>Synchro interrompue</Text>
                  </View>
                  <Text style={styles.syncBannerBody}>{cloudSyncListenError}</Text>
                </View>
              ) : null}
              {remoteOk && mapTruth === 'en_route_no_fix' ? (
                <View style={styles.syncBanner}>
                  <View style={styles.syncBannerHead}>
                    <Ionicons name="navigate" size={15} color={WC.neonOrange} />
                    <Text style={styles.syncBannerTitle}>Position livreur</Text>
                  </View>
                  <Text style={styles.syncBannerBody}>
                    Vous êtes en route côté commande, mais aucune position n’arrive encore. Vérifiez le
                    réseau, l’app livreur ouverte, et que le livreur a bien pris la course.
                  </Text>
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
                  Le livreur prend la course. Le suivi live s’active dès le premier signal GPS fiable.
                </Text>
              ) : null}

              {active && mapRegion ? (
                <View style={styles.mapWrap}>
                  <View style={styles.mapInfoPanel}>
                    <Text style={[styles.mapKicker, compactMapUi && styles.mapKickerCompact]}>{mapKicker}</Text>
                    <Text style={[styles.mapTitle, compactMapUi && styles.mapTitleCompact]}>{mapTitle}</Text>
                    <Text style={[styles.mapSub, compactMapUi && styles.mapSubCompact]}>{mapSub}</Text>
                    {signalUi ? (
                      <View
                        style={[
                          styles.signalChip,
                          signalUi.style,
                        ]}
                      >
                        <Ionicons name={signalUi.icon} size={14} color={signalUi.iconColor} />
                        <Text style={[styles.signalChipTxt, compactMapUi && styles.signalChipTxtCompact]}>
                          {signalUi.label}
                        </Text>
                      </View>
                    ) : null}
                    {driverPositionLabel ? (
                      <Text style={[styles.mapFreshness, compactMapUi && styles.mapFreshnessCompact]}>
                        {driverPositionLabel}
                      </Text>
                    ) : null}
                  </View>
                  <MiniMapCanvas
                    mapSize={mapSize}
                    mapRegion={mapRegion}
                    driver={driver}
                    driverHeading={driverHeading}
                    dest={dest}
                    mapHudFooter={mapHudFooter}
                    mapAccessibilityLabel={mapAccessibilityLabel}
                  />
                </View>
              ) : null}

              <View style={styles.contactStrip}>
                <Text style={styles.contactStripLbl}>HUSKO</Text>
                <Pressable
                  onPress={() => void Linking.openURL(CLIENT_SNAP_ADD_URL)}
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
  etaDemoHint: {
    marginTop: spacing.sm,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  syncBanner: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: clientSuiviVisual.syncBannerBorder,
    backgroundColor: clientSuiviVisual.syncBannerBg,
  },
  syncBannerError: {
    borderColor: clientSuiviVisual.syncErrorBorder,
    backgroundColor: clientSuiviVisual.syncErrorBg,
  },
  syncBannerTitle: {
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 1,
    color: WC.neonOrange,
  },
  syncBannerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  syncBannerBody: {
    ...typography.bodyMuted,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,250,245,0.88)',
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
    minHeight: 44,
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
  mapInfoPanel: {
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.2)',
    backgroundColor: 'rgba(8, 4, 6, 0.45)',
  },
  mapKicker: {
    alignSelf: 'center',
    marginBottom: spacing.xs,
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 3,
    color: WC.fire,
    opacity: 0.95,
  },
  mapKickerCompact: { fontSize: 9, letterSpacing: 2.2 },
  mapTitle: {
    ...typography.section,
    marginBottom: spacing.xs,
    alignSelf: 'stretch',
    textAlign: 'center',
    color: colors.gold,
    fontSize: 14,
    letterSpacing: 1.2,
  },
  mapTitleCompact: { fontSize: 13, letterSpacing: 0.8 },
  mapSub: {
    fontFamily: FONT.medium,
    textAlign: 'center',
    color: WC.neonCyan,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.md,
    opacity: 0.92,
    lineHeight: 17,
    paddingHorizontal: spacing.xs,
  },
  mapSubCompact: { fontSize: 11, lineHeight: 16 },
  mapFreshness: {
    marginBottom: spacing.xs,
    fontFamily: FONT.medium,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  mapFreshnessCompact: { fontSize: 11 },
  signalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  signalChipFresh: {
    borderColor: 'rgba(34, 197, 94, 0.55)',
    backgroundColor: 'rgba(22, 101, 52, 0.25)',
  },
  signalChipAging: {
    borderColor: 'rgba(252, 211, 77, 0.55)',
    backgroundColor: 'rgba(146, 64, 14, 0.22)',
  },
  signalChipOld: {
    borderColor: 'rgba(248, 113, 113, 0.55)',
    backgroundColor: 'rgba(127, 29, 29, 0.28)',
  },
  signalChipTxt: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: colors.text,
  },
  signalChipTxtCompact: { fontSize: 11 },
  mapWrap: {
    marginTop: spacing.sm,
    alignItems: 'center',
    width: '100%',
  },
  mapNeonOuter: {
    borderRadius: radius.lg,
    padding: 3,
    borderWidth: 1,
    borderColor: clientSuiviVisual.mapNeonBorder,
    backgroundColor: clientSuiviVisual.mapNeonBg,
    ...Platform.select({
      ios: {
        shadowColor: clientSuiviVisual.mapNeonShadow,
        shadowOpacity: 0.5,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 10 },
      default: {},
    }),
  },
  historiqueLinkWrap: { marginTop: spacing.md, marginBottom: spacing.sm },
  infra: { marginTop: spacing.lg },
});
