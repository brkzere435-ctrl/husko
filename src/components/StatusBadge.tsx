import { StyleSheet, Text, View } from 'react-native';

import { ORDER_STATUS_LABEL } from '@/constants/orderStatus';
import { colors, radius, spacing } from '@/constants/theme';
import type { OrderStatus } from '@/stores/useHuskoStore';

const TONE: Partial<Record<OrderStatus, { bg: string; border: string; text: string; dot: string }>> = {
  pending: { bg: 'rgba(240,208,80,0.12)', border: colors.goldDim, text: colors.gold, dot: colors.gold },
  preparing: {
    bg: 'rgba(200, 120, 40, 0.2)',
    border: '#c9a020',
    text: '#ffd78a',
    dot: '#ffb347',
  },
  awaiting_livreur: {
    bg: 'rgba(80, 140, 220, 0.2)',
    border: '#6a9ee8',
    text: '#b8d4ff',
    dot: '#6a9ee8',
  },
  on_way: {
    bg: 'rgba(212, 40, 40, 0.22)',
    border: colors.posterRed,
    text: '#ffb4b4',
    dot: colors.posterRed,
  },
  delivered: { bg: 'rgba(80, 80, 90, 0.35)', border: '#666', text: colors.textMuted, dot: '#888' },
  cancelled: { bg: 'rgba(40, 40, 40, 0.5)', border: '#444', text: colors.textMuted, dot: '#555' },
};

type Props = { status: OrderStatus };

export function StatusBadge({ status }: Props) {
  const t = TONE[status] ?? {
    bg: 'rgba(255,255,255,0.06)',
    border: colors.border,
    text: colors.text,
    dot: colors.textMuted,
  };
  return (
    <View style={[styles.wrap, { backgroundColor: t.bg, borderColor: t.border }]}>
      <View style={[styles.dot, { backgroundColor: t.dot }]} />
      <Text style={[styles.txt, { color: t.text }]}>{ORDER_STATUS_LABEL[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  txt: { fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
});
