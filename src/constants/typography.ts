import { Platform, TextStyle } from 'react-native';

import { colors } from '@/constants/theme';

/** Sans-serif système, rendu dense type affiche urbaine. */
const urban = Platform.select({
  ios: { fontFamily: undefined },
  android: { fontFamily: 'sans-serif' },
  default: { fontFamily: undefined },
}) satisfies Partial<TextStyle>;

export const typography = {
  display: {
    ...urban,
    fontSize: 42,
    fontWeight: '900' as const,
    letterSpacing: 4,
    color: colors.text,
  },
  /** Hub & menu — nom marque */
  heroBrand: {
    ...urban,
    fontSize: 34,
    fontWeight: '900' as const,
    letterSpacing: 2.5,
    color: colors.text,
  },
  heroTagline: {
    ...urban,
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginTop: 6,
  },
  title: {
    ...urban,
    fontSize: 22,
    fontWeight: '800' as const,
    letterSpacing: 0.2,
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textMuted,
  },
  section: {
    ...urban,
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 1.4,
    color: colors.gold,
    textTransform: 'uppercase' as const,
  },
  body: {
    ...urban,
    fontSize: 16,
    fontWeight: '600' as const,
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
