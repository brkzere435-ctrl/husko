import { TextStyle } from 'react-native';

import { colors } from '@/constants/theme';

export const typography = {
  display: {
    fontSize: 42,
    fontWeight: '900' as const,
    letterSpacing: 4,
    color: colors.text,
  },
  /** Hub & menu — nom marque */
  heroBrand: {
    fontSize: 34,
    fontWeight: '900' as const,
    letterSpacing: 2,
    color: colors.text,
  },
  heroTagline: {
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginTop: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textMuted,
  },
  section: {
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 1.2,
    color: colors.gold,
    textTransform: 'uppercase' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.text,
    lineHeight: 23,
  },
  bodyMuted: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textMuted,
    lineHeight: 21,
  },
  price: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: colors.gold,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textMuted,
  },
  mono: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.goldDim,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
    letterSpacing: 0.5,
  },
};
