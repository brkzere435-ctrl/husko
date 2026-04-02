/**
 * Thème Material Design 3 (React Native Paper) calé sur le design system Husko.
 * @see https://callstack.github.io/react-native-paper/docs/guides/theming
 */
import { MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

import { FONT } from '@/constants/fonts';
import { colors, radius } from '@/constants/theme';

const fonts = configureFonts({
  isV3: true,
  config: {
    fontFamily: FONT.regular,
    fontWeight: '400',
  },
});

export const huskoPaperTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: radius.md,
  fonts,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.accent,
    onPrimary: colors.text,
    primaryContainer: colors.accentDeep,
    onPrimaryContainer: colors.text,
    secondary: colors.gold,
    onSecondary: '#1c0a0a',
    secondaryContainer: colors.accentDim,
    onSecondaryContainer: colors.gold,
    tertiary: colors.goldDim,
    onTertiary: colors.bg,
    tertiaryContainer: colors.border,
    onTertiaryContainer: colors.text,
    background: colors.bg,
    onBackground: colors.text,
    surface: colors.card,
    onSurface: colors.text,
    surfaceVariant: colors.cardElevated,
    onSurfaceVariant: colors.textMuted,
    outline: colors.border,
    outlineVariant: colors.borderSubtle,
    error: colors.posterRed,
    onError: colors.text,
    errorContainer: colors.accentDim,
    onErrorContainer: colors.text,
    inverseSurface: colors.text,
    inverseOnSurface: colors.bg,
    inversePrimary: colors.accentMid,
    backdrop: 'rgba(2, 1, 1, 0.6)',
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: colors.bgLift,
      level2: colors.card,
      level3: colors.cardElevated,
      level4: colors.cardElevated,
      level5: colors.cardElevated,
    },
  },
};
