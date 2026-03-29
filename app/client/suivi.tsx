import { Link } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeploymentHints } from '@/components/DeploymentHints';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { GTAMiniMap } from '@/components/GTAMiniMap';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusBadge } from '@/components/StatusBadge';
import {
  AUTONOMOUS_PACE_PRESETS,
  estimatedMsUntilDelivered,
  formatEtaUntilDelivery,
} from '@/constants/autonomousDelivery';
import { clientStrings } from '@/constants/clientExperience';
import { PENDING_VALIDATION_MS } from '@/constants/orderPolicy';
import { CLIENT_TIMELINE, timelineStepIndex } from '@/constants/orderFlow';
import { PAYMENT_NOTICE_SHORT } from '@/constants/paymentPolicy';
import { typography } from '@/constants/typography';
import { colors, elevation, radius, spacing } from '@/constants/theme';
import { useHuskoStore } from '@/stores/useHuskoStore';

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

  const region = {
    latitude: active?.destLat ?? 47.4739,
    longitude: active?.destLng ?? -0.5517,
    latitudeDelta: 0.06,
    longitudeDelta: 0.06,
  };

  const dest = active
    ? { latitude: active.destLat, longitude: active.destLng }
    : null;

  const showLiveMap = active?.status === 'on_way';

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

  return (
    <WestCoastBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {active ? (
            <View style={styles.card}>
              <Text style={typography.mono}>{active.id}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={active.status} />
              </View>

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

              <View style={styles.timelineWrap}>
                <View style={styles.timelineRail} />
                {CLIENT_TIMELINE.map((step, i) => {
                  const done = stepIdx >= i;
                  const current = stepIdx === i;
                  const last = i === CLIENT_TIMELINE.length - 1;
                  return (
                    <View key={step.status} style={[styles.tlRow, !last && styles.tlRowSpaced]}>
                      <View style={styles.tlDotCol}>
                        <View
                          style={[
                            styles.tlDot,
                            done ? styles.tlDotOn : styles.tlDotOff,
                            current && styles.tlDotCurrent,
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.tlLabel,
                          done ? styles.tlDone : styles.tlPending,
                          current && styles.tlCurrent,
                        ]}
                      >
                        {step.label}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <Text style={[typography.body, styles.addr]}>{active.addressLabel}</Text>
              <Text style={typography.price}>{active.total.toFixed(2)} €</Text>
              <Text style={[typography.caption, styles.pay]}>{PAYMENT_NOTICE_SHORT}</Text>

              {active.status === 'awaiting_livreur' ? (
                <Text style={[typography.bodyMuted, styles.mapHint]}>
                  Un livreur va bientôt prendre en charge votre commande. La carte s’affiche dès qu’il est en
                  route.
                </Text>
              ) : null}

              {showLiveMap ? (
                <View style={styles.mapWrap}>
                  <Text style={styles.mapTitle}>Suivi Cadillac · mode GTA</Text>
                  <Text style={styles.mapSub}>GPS West Coast — le livreur roule vers toi</Text>
                  <GTAMiniMap
                    region={region}
                    driver={driver}
                    headingDeg={driverHeading}
                    dest={dest}
                    showDest={!!dest}
                    hudFooter="LBC · DROP TOP · EN ROUTE"
                  />
                </View>
              ) : null}
            </View>
          ) : showDeliveredThanks ? (
            <View style={[styles.card, styles.merciCard, elevation.card]}>
              <Text style={styles.merciTitle}>{clientStrings.suiviMerciTitle}</Text>
              <Text style={[typography.bodyMuted, styles.merciBody]}>{clientStrings.suiviMerciBody}</Text>
              <Text style={[typography.mono, styles.merciRef]}>{latestOrder?.id}</Text>
              <Link href="/client" asChild>
                <PrimaryButton title={clientStrings.suiviNewOrder} style={styles.merciBtn} />
              </Link>
            </View>
          ) : latestCancelled ? (
            <View style={[styles.card, styles.cancelCard, elevation.card]}>
              <Text style={styles.cancelTitle}>{clientStrings.suiviCancelledTitle}</Text>
              <Text style={[typography.bodyMuted, styles.cancelBody]}>
                {clientStrings.suiviCancelledBody(latestCancelled.id)}
              </Text>
              <Link href="/client" asChild>
                <PrimaryButton title={clientStrings.suiviGoMenu} style={styles.merciBtn} />
              </Link>
            </View>
          ) : (
            <View style={[styles.card, styles.emptyCard, elevation.card]}>
              <Text style={typography.title}>{clientStrings.suiviEmptyTitle}</Text>
              <Text style={[typography.bodyMuted, styles.emptyBody]}>{clientStrings.suiviEmptyBody}</Text>
              <Link href="/client" asChild>
                <PrimaryButton title={clientStrings.suiviGoMenu} style={styles.emptyBtn} />
              </Link>
            </View>
          )}
          <DeploymentHints mode="alerts" mapsRelevant={showLiveMap} style={styles.infra} />
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
    borderColor: 'rgba(248, 113, 113, 0.45)',
  },
  cancelTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fca5a5',
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
    fontSize: 22,
    fontWeight: '900',
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
    padding: spacing.lg,
  },
  badgeRow: { marginTop: spacing.sm, marginBottom: spacing.sm },
  pendingHint: {
    marginBottom: spacing.md,
    color: '#67e8f9',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  etaLine: { marginBottom: spacing.md, color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  etaStrong: { color: colors.gold, fontWeight: '800' },
  timelineWrap: {
    position: 'relative',
    marginBottom: spacing.lg,
    paddingLeft: 4,
  },
  timelineRail: {
    position: 'absolute',
    left: 15,
    top: 14,
    bottom: 14,
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.borderSubtle,
  },
  tlRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 28,
  },
  tlRowSpaced: { marginBottom: spacing.md },
  tlDotCol: {
    width: 32,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  tlDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    marginTop: 2,
    zIndex: 2,
    backgroundColor: colors.bgLift,
  },
  tlDotOff: { borderColor: colors.border, backgroundColor: 'transparent' },
  tlDotOn: { borderColor: colors.gold, backgroundColor: colors.goldDim },
  tlDotCurrent: {
    borderColor: colors.gold,
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  tlLabel: { flex: 1, fontSize: 15, fontWeight: '600', paddingTop: 1 },
  tlDone: { color: colors.text },
  tlPending: { color: colors.textMuted },
  tlCurrent: { color: colors.gold, fontWeight: '800' },
  addr: { marginTop: spacing.xs },
  pay: { marginTop: spacing.md, fontStyle: 'italic' },
  mapHint: { marginTop: spacing.md },
  mapTitle: {
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
    alignSelf: 'stretch',
    textAlign: 'center',
    color: colors.gold,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  mapSub: {
    textAlign: 'center',
    color: '#67e8f9',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: spacing.sm,
    opacity: 0.9,
  },
  mapWrap: { marginTop: spacing.lg, alignItems: 'center' },
  infra: { marginTop: spacing.lg },
});
