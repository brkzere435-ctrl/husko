import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusBadge } from '@/components/StatusBadge';
import { typography } from '@/constants/typography';
import { colors, elevation, radius, spacing } from '@/constants/theme';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { hapticLight } from '@/utils/haptics';

export function LivreurOrderPanel() {
  const orders = useHuskoStore((s) => s.orders);
  const transitionOrder = useHuskoStore((s) => s.transitionOrder);

  const pickup = orders.filter((o) => o.status === 'awaiting_livreur');
  const enRoute = orders.filter((o) => o.status === 'on_way');

  return (
    <ScrollView
      style={styles.wrap}
      contentContainerStyle={styles.inner}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Courses</Text>
      {pickup.length === 0 && enRoute.length === 0 ? (
        <Text style={typography.bodyMuted}>Aucune course assignée.</Text>
      ) : null}

      {pickup.map((o) => (
        <View key={o.id} style={styles.card}>
          <Text style={typography.mono}>{o.id}</Text>
          <StatusBadge status={o.status} />
          <Text style={[typography.body, styles.addr]}>{o.addressLabel}</Text>
          <Text style={typography.price}>{o.total.toFixed(2)} €</Text>
          <PrimaryButton
            title="Prendre en charge · en route"
            onPress={() => {
              if (transitionOrder(o.id, 'on_way', 'livreur')) hapticLight();
            }}
            style={styles.btn}
          />
        </View>
      ))}

      {enRoute.map((o) => (
        <View key={o.id} style={styles.card}>
          <Text style={typography.mono}>{o.id}</Text>
          <StatusBadge status={o.status} />
          <Text style={[typography.body, styles.addr]}>{o.addressLabel}</Text>
          <Text style={typography.price}>{o.total.toFixed(2)} €</Text>
          <PrimaryButton
            title="Confirmer la livraison"
            onPress={() => {
              if (transitionOrder(o.id, 'delivered', 'livreur')) hapticLight();
            }}
            style={styles.btn}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    maxHeight: 260,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  inner: { padding: spacing.md, paddingBottom: spacing.lg, gap: spacing.sm },
  title: {
    color: colors.gold,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...elevation.card,
  },
  addr: { marginTop: spacing.xs },
  btn: { marginTop: spacing.sm },
});
