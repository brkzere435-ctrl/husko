import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeploymentHints } from '@/components/DeploymentHints';
import { HuskoBackground } from '@/components/HuskoBackground';
import { GTAMiniMap } from '@/components/GTAMiniMap';
import { StatusBadge } from '@/components/StatusBadge';
import {
  AUTONOMOUS_PACE_PRESETS,
  estimatedMsUntilDelivered,
  formatEtaUntilDelivery,
} from '@/constants/autonomousDelivery';
import { CLIENT_TIMELINE, timelineStepIndex } from '@/constants/orderFlow';
import { PAYMENT_NOTICE_SHORT } from '@/constants/paymentPolicy';
import { typography } from '@/constants/typography';
import { colors, radius, spacing } from '@/constants/theme';
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
    <HuskoBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {!active ? (
            <Text style={[typography.bodyMuted, styles.empty]}>Aucune commande en cours.</Text>
          ) : (
            <View style={styles.card}>
              <Text style={typography.mono}>{active.id}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={active.status} />
              </View>

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
                  <Text style={styles.mapTitle}>Suivi livreur</Text>
                  <GTAMiniMap
                    region={region}
                    driver={driver}
                    headingDeg={driverHeading}
                    dest={dest}
                    showDest={!!dest}
                  />
                </View>
              ) : null}
            </View>
          )}
          <DeploymentHints mode="alerts" mapsRelevant={showLiveMap} style={styles.infra} />
        </ScrollView>
      </SafeAreaView>
    </HuskoBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  empty: { textAlign: 'center', marginTop: spacing.xl },
  card: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
  },
  badgeRow: { marginTop: spacing.sm, marginBottom: spacing.sm },
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
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    alignSelf: 'stretch',
    textAlign: 'center',
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  mapWrap: { marginTop: spacing.lg, alignItems: 'center' },
  infra: { marginTop: spacing.lg },
});
