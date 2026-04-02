import { TextStyle } from 'react-native';

import { FONT } from '@/constants/fonts';
import { colors } from '@/constants/theme';

/** Oswald (chargée au boot) — affiche urbaine / West Coast. */
const urban = { fontFamily: FONT.regular } satisfies Partial<TextStyle>;
const urbanMedium = { fontFamily: FONT.medium } satisfies Partial<TextStyle>;
const urbanBold = { fontFamily: FONT.bold } satisfies Partial<TextStyle>;

export const typography = {
  display: {
    ...urbanBold,
    fontSize: 42,
    letterSpacing: 3,
    color: colors.text,
  },
  /** Hub & menu — nom marque */
  heroBrand: {
    ...urbanBold,
    fontSize: 34,
    letterSpacing: 2,
    color: colors.text,
  },
  heroTagline: {
    ...urbanMedium,
    fontSize: 15,
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginTop: 6,
  },
  title: {
    ...urbanBold,
    fontSize: 22,
    letterSpacing: 0.2,
    color: colors.text,
  },
  subtitle: {
    ...urbanMedium,
    fontSize: 15,
    color: colors.textMuted,
  },
  section: {
    ...urbanBold,
    fontSize: 12,
    letterSpacing: 1.4,
    color: colors.gold,
    textTransform: 'uppercase' as const,
  },
  body: {
    ...urbanMedium,
    fontSize: 16,
    color: colors.text,
    lineHeight: 23,
  },
  bodyMuted: {
    ...urban,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
  },
  price: {
    ...urbanBold,
    fontSize: 17,
    color: colors.gold,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  },
  caption: {
    ...urbanMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
  mono: {
    ...urbanMedium,
    fontSize: 13,
    color: colors.goldDim,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
    letterSpacing: 0.5,
  },
};
