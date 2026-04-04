import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { screenSectionVisual } from '@/constants/screenSectionVisual';
import { typography } from '@/constants/typography';
import { elevation, radius, spacing } from '@/constants/theme';

type Props = { title: string; children: ReactNode };

export function ScreenSection({ title, children }: Props) {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[...screenSectionVisual.titleBarGradient]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.titleAccent}
      />
      <Text style={[typography.section, styles.title]} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
    backgroundColor: screenSectionVisual.cardBg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: screenSectionVisual.cardBorder,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm + 4,
    overflow: 'hidden',
    ...elevation.card,
  },
  titleAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.95,
  },
  title: { marginBottom: spacing.sm },
});
