import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { OrderLinesPreview } from '@/components/OrderLinesPreview';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusBadge } from '@/components/StatusBadge';
import { typography } from '@/constants/typography';
import { colors, elevation, radius, spacing } from '@/constants/theme';
import { WC, wcSectionLabel } from '@/constants/westCoastTheme';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { hapticLight, hapticSuccess } from '@/utils/haptics';

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
      <Text style={[wcSectionLabel, styles.title]}>Courses</Text>
      {pickup.length === 0 && enRoute.length === 0 ? (
        <Text style={typography.bodyMuted}>Aucune course assignée.</Text>
      ) : null}

      {pickup.map((o) => (
        <View key={o.id} style={styles.card}>
          <Text style={typography.mono}>{o.id}</Text>
          <StatusBadge status={o.status} />
          <OrderLinesPreview lines={o.lines} compact />
          <Text style={[typography.body, styles.addr]}>{o.addressLabel}</Text>
          <Text style={typography.price}>{o.total.toFixed(2)} €</Text>
          <PrimaryButton
            title="Prendre en charge · en route"
            onPress={() => {
              const ok = transitionOrder(o.id, 'on_way', 'livreur');
              if (ok) hapticLight();
              else
                Alert.alert(
                  'Action impossible',
                  'Vérifiez que la commande est bien « attente livreur » et réessayez.'
                );
            }}
            style={styles.btn}
          />
        </View>
      ))}

      {enRoute.map((o) => (
        <View key={o.id} style={styles.card}>
          <Text style={typography.mono}>{o.id}</Text>
          <StatusBadge status={o.status} />
          <OrderLinesPreview lines={o.lines} compact />
          <Text style={[typography.body, styles.addr]}>{o.addressLabel}</Text>
          <Text style={typography.price}>{o.total.toFixed(2)} €</Text>
          <PrimaryButton
            title="Confirmer la livraison"
            onPress={() => {
              Alert.alert(
                'Livraison complète',
                `Confirmer que la commande ${o.id} a bien été remise au client ?`,
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Oui, livrée',
                    onPress: () => {
                      const ok = transitionOrder(o.id, 'delivered', 'livreur');
                      if (ok) hapticSuccess();
                      else
                        Alert.alert(
                          'Action impossible',
                          'La commande doit être « en livraison » pour être clôturée.'
                        );
                    },
                  },
                ]
              );
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
    borderBottomWidth: 2,
    borderColor: WC.neonCyanDim,
  },
  inner: { padding: spacing.md, paddingBottom: spacing.lg, gap: spacing.sm },
  title: {
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: WC.neonCyanDim,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...elevation.card,
  },
  addr: { marginTop: spacing.xs },
  btn: { marginTop: spacing.sm },
});
