import { Fragment, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Dialog, Portal, Text as PaperText } from 'react-native-paper';

import { OrderLinesPreview } from '@/components/OrderLinesPreview';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusBadge } from '@/components/StatusBadge';
import { typography } from '@/constants/typography';
import { colors, elevation, radius, spacing } from '@/constants/theme';
import { WC, wcSectionLabel } from '@/constants/westCoastTheme';
import { openTechnicalFeedback } from '@/navigation/openTechnicalFeedback';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { formatEuro } from '@/utils/formatEuro';
import { hapticLight, hapticSuccess } from '@/utils/haptics';

type ActionFailDialog = {
  title: string;
  body: string;
  detail: string;
};

export function LivreurOrderPanel() {
  const orders = useHuskoStore((s) => s.orders);
  const transitionOrder = useHuskoStore((s) => s.transitionOrder);
  const [failDialog, setFailDialog] = useState<ActionFailDialog | null>(null);

  const pickup = orders.filter((o) => o.status === 'awaiting_livreur');
  const enRoute = orders.filter((o) => o.status === 'on_way');

  return (
    <Fragment>
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
          <Text style={typography.price}>{formatEuro(o.total)}</Text>
          <PrimaryButton
            title="Prendre en charge · en route"
            onPress={() => {
              const ok = transitionOrder(o.id, 'on_way', 'livreur');
              if (ok) hapticLight();
              else {
                setFailDialog({
                  title: 'Action impossible',
                  body: 'Vérifiez que la commande est bien « attente livreur » et réessayez.',
                  detail: `orderId=${o.id} status=${o.status} transition=on_way actor=livreur`,
                });
              }
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
          <Text style={typography.price}>{formatEuro(o.total)}</Text>
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
                      else {
                        setFailDialog({
                          title: 'Action impossible',
                          body: 'La commande doit être « en livraison » pour être clôturée.',
                          detail: `orderId=${o.id} status=${o.status} transition=delivered actor=livreur`,
                        });
                      }
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
      <Portal>
        <Dialog visible={failDialog !== null} onDismiss={() => setFailDialog(null)}>
          {failDialog ? (
            <>
              <Dialog.Title>{failDialog.title}</Dialog.Title>
              <Dialog.Content>
                <PaperText variant="bodyMedium">{failDialog.body}</PaperText>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setFailDialog(null)}>OK</Button>
                <Button
                  onPress={() => {
                    const { title, body, detail } = failDialog;
                    setFailDialog(null);
                    openTechnicalFeedback({ title, body, detail });
                  }}
                >
                  Détail technique
                </Button>
              </Dialog.Actions>
            </>
          ) : null}
        </Dialog>
      </Portal>
    </Fragment>
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
