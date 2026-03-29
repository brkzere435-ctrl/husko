import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeploymentHints } from '@/components/DeploymentHints';
import { HuskoBackground } from '@/components/HuskoBackground';
import { StatusBadge } from '@/components/StatusBadge';
import { typography } from '@/constants/typography';
import { spacing, surface } from '@/constants/theme';
import { useHuskoStore } from '@/stores/useHuskoStore';

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
    <HuskoBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <FlatList
          data={done}
          keyExtractor={(o) => o.id}
          ListHeaderComponent={
            <DeploymentHints mode="alerts" mapsRelevant={false} style={styles.infra} />
          }
          ListEmptyComponent={
            <View style={[surface.glass, styles.emptyWrap]}>
              <Text style={typography.section}>Historique</Text>
              <Text style={[typography.bodyMuted, styles.emptyText]}>
                Aucune commande livrée ou annulée pour l’instant. Les terminées apparaîtront ici, les
                plus récentes en premier.
              </Text>
            </View>
          }
          contentContainerStyle={styles.list}
          renderItem={({ item: o }) => (
            <View style={[surface.elevated, styles.row]}>
              <Text style={typography.mono}>{o.id}</Text>
              <View style={styles.badge}>
                <StatusBadge status={o.status} />
              </View>
              <Text style={typography.caption}>
                {new Date(o.createdAt).toLocaleString('fr-FR')}
              </Text>
              <Text style={typography.price}>{o.total.toFixed(2)} €</Text>
              <Text style={[typography.bodyMuted, styles.addr]}>{o.addressLabel}</Text>
            </View>
          )}
        />
      </SafeAreaView>
    </HuskoBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  infra: { marginBottom: spacing.md },
  row: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyWrap: { padding: spacing.lg, marginBottom: spacing.md, gap: spacing.sm },
  emptyText: { lineHeight: 22 },
  badge: { marginVertical: spacing.sm },
  addr: { marginTop: spacing.xs },
});
