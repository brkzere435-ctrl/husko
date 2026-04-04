import { StyleSheet, Text, View } from 'react-native';

import { ORDER_STATUS_LABEL } from '@/constants/orderStatus';
import { statusBadgeBackground } from '@/constants/statusVisual';
import { colors, radius, spacing } from '@/constants/theme';
import type { OrderStatus } from '@/stores/useHuskoStore';

const TONE: Partial<Record<OrderStatus, { bg: string; border: string; text: string; dot: string }>> = {
  pending: {
    bg: statusBadgeBackground.pending,
    border: colors.goldDim,
    text: colors.gold,
    dot: colors.gold,
  },
  preparing: {
    bg: statusBadgeBackground.preparing,
    border: colors.statusPreparingBorder,
    text: colors.statusPreparingText,
    dot: colors.statusPreparingDot,
  },
  awaiting_livreur: {
    bg: statusBadgeBackground.awaiting_livreur,
    border: colors.statusAwaitingBorder,
    text: colors.statusAwaitingText,
    dot: colors.statusAwaitingDot,
  },
  on_way: {
    bg: statusBadgeBackground.on_way,
    border: colors.posterRed,
    text: colors.statusOnWayText,
    dot: colors.posterRed,
  },
  delivered: {
    bg: statusBadgeBackground.delivered,
    border: colors.statusNeutralBorder,
    text: colors.textMuted,
    dot: colors.statusNeutralDot,
  },
  cancelled: {
    bg: statusBadgeBackground.cancelled,
    border: colors.statusCancelledBorder,
    text: colors.textMuted,
    dot: colors.statusCancelledDot,
  },
};

type Props = { status: OrderStatus };

export function StatusBadge({ status }: Props) {
  const t = TONE[status] ?? {
    bg: statusBadgeBackground.fallback,
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
