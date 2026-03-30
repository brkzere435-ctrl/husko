import { StyleSheet, Text, View } from 'react-native';

import { typography } from '@/constants/typography';
import { colors, spacing } from '@/constants/theme';
import type { OrderLine } from '@/stores/useHuskoStore';

type Props = { lines: OrderLine[]; compact?: boolean };

/** Détail panier sur fiches gérant / livreur. */
export function OrderLinesPreview({ lines, compact }: Props) {
  if (!lines.length) return null;
  return (
    <View style={styles.wrap} accessibilityLabel="Détail commande">
      {lines.map((l) => (
        <View key={`${l.item.id}-${l.qty}`} style={styles.row}>
          <Text style={styles.qty}>{l.qty}×</Text>
          <Text
            style={[typography.caption, compact ? styles.lineCompact : styles.line]}
            numberOfLines={compact ? 1 : undefined}
          >
            {l.item.name}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.sm, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  line: { flex: 1, color: colors.text, lineHeight: 18 },
  lineCompact: { flex: 1, color: colors.textMuted, fontSize: 12 },
  qty: { fontWeight: '800', color: colors.gold, minWidth: 28 },
});
