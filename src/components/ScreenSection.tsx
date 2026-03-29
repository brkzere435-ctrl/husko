import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { typography } from '@/constants/typography';
import { colors, elevation, radius, spacing } from '@/constants/theme';

type Props = { title: string; children: ReactNode };

export function ScreenSection({ title, children }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[typography.section, styles.title]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
    backgroundColor: colors.cardElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    ...elevation.card,
  },
  title: { marginBottom: spacing.sm },
});
