import { useMemo, useSyncExternalStore } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONT } from '@/constants/fonts';
import { colors, radius, spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';
import {
  getDriverRemotePushErrorSnapshot,
  getDriverRemotePushLastSuccessAtSnapshot,
  subscribeDriverRemotePush,
} from '@/services/driverRemotePushFeedback';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';
import { pickRemoteDriverSubscriptionOrderId, useHuskoStore } from '@/stores/useHuskoStore';

function useDriverRemotePushError(): string | null {
  return useSyncExternalStore(
    subscribeDriverRemotePush,
    getDriverRemotePushErrorSnapshot,
    () => null
  );
}

function useDriverRemotePushLastOk(): number | null {
  return useSyncExternalStore(
    subscribeDriverRemotePush,
    getDriverRemotePushLastSuccessAtSnapshot,
    () => null
  );
}

type Props = {
  /** GPS local actif (position dans le store). */
  hasGpsFix: boolean;
  /** Interrupteur « En ligne ». */
  livreurOnline: boolean;
};

/**
 * Bandeau lisible : synchro Firebase + GPS + erreur d’écriture cloud (sinon le livreur ne comprend pas pourquoi le client ne voit rien).
 */
export function LivreurOperationalStatusBar({ hasGpsFix, livreurOnline }: Props) {
  const orders = useHuskoStore((s) => s.orders);
  const trackingOrderId = useHuskoStore((s) => s.trackingOrderId);
  const cloudError = useDriverRemotePushError();
  const lastCloudOkAt = useDriverRemotePushLastOk();
  const remoteOk = isRemoteSyncEnabled();

  const trackedOrder = useMemo(
    () => pickRemoteDriverSubscriptionOrderId(orders, trackingOrderId),
    [orders, trackingOrderId]
  );

  const cloudLine = !remoteOk
    ? { label: 'Cloud', value: 'hors ligne (pas de config Firebase dans ce build)', tone: 'bad' as const }
    : cloudError
      ? { label: 'Cloud', value: `erreur : ${cloudError}`, tone: 'bad' as const }
      : lastCloudOkAt == null
        ? {
            label: 'Cloud',
            value: 'connecté · en attente du premier envoi (GPS + course en route)',
            tone: 'warn' as const,
          }
        : { label: 'Cloud', value: 'connecté · position poussée vers le client', tone: 'good' as const };

  const gpsLine =
    !livreurOnline
      ? { label: 'GPS', value: 'éteint (passe « En ligne »)', tone: 'muted' as const }
      : hasGpsFix
        ? { label: 'GPS', value: 'point reçu', tone: 'good' as const }
        : { label: 'GPS', value: 'en attente du premier point…', tone: 'warn' as const };

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <View style={styles.row}>
        <Text style={[styles.kicker, styles[`tone_${cloudLine.tone}`]]}>{cloudLine.label}</Text>
        <Text style={[styles.value, styles[`tone_${cloudLine.tone}`]]} numberOfLines={2}>
          {cloudLine.value}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.kicker, styles[`tone_${gpsLine.tone}`]]}>{gpsLine.label}</Text>
        <Text style={[styles.value, styles[`tone_${gpsLine.tone}`]]} numberOfLines={2}>
          {gpsLine.value}
        </Text>
      </View>
      {trackedOrder ? (
        <Text style={styles.orderRef} numberOfLines={1}>
          Course suivie · {trackedOrder}
        </Text>
      ) : livreurOnline && remoteOk ? (
        <Text style={styles.orderHint} numberOfLines={2}>
          Pas de course « en route » — le client ne verra la position que si tu prends une commande en route.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.35)',
    backgroundColor: 'rgba(8, 4, 6, 0.72)',
    gap: 6,
  },
  row: { gap: 2 },
  kicker: {
    fontFamily: FONT.bold,
    fontSize: 9,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  tone_good: { color: WC.neonCyan },
  tone_warn: { color: WC.neonOrange },
  tone_bad: { color: colors.posterRed },
  tone_muted: { color: colors.textMuted },
  orderRef: {
    fontFamily: FONT.medium,
    fontSize: 10,
    color: colors.gold,
    opacity: 0.92,
    marginTop: 2,
  },
  orderHint: {
    fontFamily: FONT.medium,
    fontSize: 10,
    lineHeight: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
});
