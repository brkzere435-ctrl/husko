import { FlashList } from '@shopify/flash-list';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeploymentHints } from '@/components/DeploymentHints';
import { OrderLinesPreview } from '@/components/OrderLinesPreview';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { StatusBadge } from '@/components/StatusBadge';
import { typography } from '@/constants/typography';
import { spacing, surface } from '@/constants/theme';
import { WC, wcSectionLabel } from '@/constants/westCoastTheme';
import type { Order } from '@/stores/useHuskoStore';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { formatEuro } from '@/utils/formatEuro';

export default function HistoriqueScreen() {
  const orders = useHuskoStore((s) => s.orders);

  const done = useMemo(
    () =>
      [...orders]
        .filter((o) => o.status === 'delivered' || o.status === 'cancelled')
        .sort((a, b) => b.createdAt - a.createdAt),
    [orders]
  );

  return (
    <WestCoastBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <FlashList<Order>
          data={done}
          keyExtractor={(o) => o.id}
          drawDistance={200}
          style={styles.listFlex}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <DeploymentHints mode="alerts" mapsRelevant={false} style={styles.infra} />
          }
          ListEmptyComponent={
            <Card mode="outlined" style={[surface.glass, styles.emptyWrap]}>
              <Card.Content>
                <Text variant="titleSmall" style={[wcSectionLabel, styles.emptyTitle]}>
                  Historique
                </Text>
                <Text variant="bodyMedium" style={[typography.bodyMuted, styles.emptyText]}>
                  Aucune commande livrée ou annulée pour l’instant. Les terminées apparaîtront ici, les
                  plus récentes en premier.
                </Text>
              </Card.Content>
            </Card>
          }
          contentContainerStyle={styles.list}
          renderItem={({ item: o }) => (
            <Card mode="elevated" style={[surface.elevated, styles.row]}>
              <Card.Content style={styles.rowContent}>
                <Text variant="labelMedium" style={typography.mono}>
                  {o.id}
                </Text>
                <View style={styles.badge}>
                  <StatusBadge status={o.status} />
                </View>
                <Text variant="bodySmall" style={typography.caption}>
                  {new Date(o.createdAt).toLocaleString('fr-FR')}
                </Text>
                <Text variant="titleMedium" style={typography.price}>
                  {formatEuro(o.total)}
                </Text>
                <OrderLinesPreview lines={o.lines} compact />
                <Text variant="bodyMedium" style={[typography.bodyMuted, styles.addr]}>
                  {o.addressLabel}
                </Text>
              </Card.Content>
            </Card>
          )}
        />
      </SafeAreaView>
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  listFlex: { flex: 1 },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  infra: { marginBottom: spacing.md },
  row: {
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: WC.neonCyanDim,
  },
  rowContent: { gap: spacing.xs },
  emptyTitle: { marginBottom: spacing.sm },
  emptyWrap: { padding: spacing.lg, marginBottom: spacing.md, gap: spacing.sm },
  emptyText: { lineHeight: 22 },
  badge: { marginVertical: spacing.sm },
  addr: { marginTop: spacing.xs },
});
