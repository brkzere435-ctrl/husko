import { StyleSheet, Text, View } from 'react-native';

import { FONT } from '@/constants/fonts';
import { typography } from '@/constants/typography';
import { appScreenVisual } from '@/constants/appScreenVisual';
import { colors, radius, spacing } from '@/constants/theme';
import { WC, wcSectionLabel } from '@/constants/westCoastTheme';

const STEPS = [
  'Client valide le panier → commande « en attente ».',
  'Gérant : Valider · en préparation, puis Transmettre au livreur.',
  'Livreur : Prendre en charge · en route (GPS partagé).',
  'Livreur : Confirmer la livraison → terminé côté client & historique gérant.',
];

/** Rappel du flux jusqu’à livraison complète (écran gérant). */
export function DeliveryFlowGuide() {
  return (
    <View style={styles.box}>
      <Text style={[wcSectionLabel, styles.title]} accessibilityRole="header">
        Parcours jusqu’à livraison complète
      </Text>
      {STEPS.map((t, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.num}>{i + 1}</Text>
          <Text style={[typography.caption, styles.step]}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: WC.neonCyanDim,
    backgroundColor: appScreenVisual.overlay035,
    gap: spacing.sm,
  },
  title: {
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  num: {
    fontFamily: FONT.bold,
    width: 22,
    textAlign: 'center',
    fontSize: 11,
    color: WC.neonCyan,
    marginTop: 1,
  },
  step: { flex: 1, color: colors.textMuted, lineHeight: 18 },
});
