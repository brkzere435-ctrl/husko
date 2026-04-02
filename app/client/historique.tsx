import { Link } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusBadge } from '@/components/StatusBadge';
import { clientStrings } from '@/constants/clientExperience';
import { typography } from '@/constants/typography';
import { colors, elevation, radius, spacing } from '@/constants/theme';
import type { Order } from '@/stores/useHuskoStore';
import { useHuskoStore } from '@/stores/useHuskoStore';

function formatWhen(createdAt: number) {
  try {
    return new Date(createdAt).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function PastOrderRow({ order }: { order: Order }) {
  return (
    <Card mode="outlined" style={[styles.row, elevation.card]}>
      <Card.Content style={styles.rowContent}>
        <Text variant="labelMedium" style={styles.rowId}>
          {order.id}
        </Text>
        <Text variant="bodySmall" style={[typography.caption, styles.rowWhen]}>
          {formatWhen(order.createdAt)}
        </Text>
        <View style={styles.rowBadge}>
          <StatusBadge status={order.status} />
        </View>
        <Text variant="titleMedium" style={styles.rowTotal}>
          {order.total.toFixed(2)} €
        </Text>
        <Text variant="bodySmall" style={[typography.caption, styles.rowAddr]} numberOfLines={2}>
          {order.addressLabel}
        </Text>
      </Card.Content>
    </Card>
  );
}

export default function ClientHistoriqueScreen() {
  const orders = useHuskoStore((s) => s.orders);

  const past = useMemo(() => {
    const list = orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');
    return [...list].sort((a, b) => b.createdAt - a.createdAt);
  }, [orders]);

  return (
    <WestCoastBackground preset="client">
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text variant="bodyMedium" style={[typography.bodyMuted, styles.intro]}>
            Commandes terminées sur cet appareil (synchronisées avec le restaurant si Firebase est actif).
          </Text>

          {past.length === 0 ? (
            <Card mode="outlined" style={[styles.empty, elevation.card]}>
              <Card.Content>
                <Text variant="bodyMedium" style={[typography.bodyMuted, styles.emptyText]}>
                  {clientStrings.historiqueEmpty}
                </Text>
              </Card.Content>
            </Card>
          ) : (
            past.map((o) => <PastOrderRow key={o.id} order={o} />)
          )}

          <Link href="/client" asChild>
            <PrimaryButton title={clientStrings.suiviGoMenu} style={styles.btn} />
          </Link>
        </ScrollView>
      </SafeAreaView>
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  intro: { marginBottom: spacing.sm, lineHeight: 20 },
  empty: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.cardElevated,
  },
  emptyText: { textAlign: 'center', lineHeight: 22 },
  row: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.cardElevated,
  },
  rowContent: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  rowId: { ...typography.mono, fontSize: 12 },
  rowWhen: { color: colors.textMuted },
  rowBadge: { alignSelf: 'flex-start', marginTop: spacing.xs },
  rowTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.gold,
    fontVariant: ['tabular-nums'],
  },
  rowAddr: { color: colors.textMuted, marginTop: spacing.xs },
  btn: { marginTop: spacing.md },
});
