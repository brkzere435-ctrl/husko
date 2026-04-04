import { Image, Platform, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { VENUE_TAGLINE_CLIENT } from '@/constants/venue';

const ICON = require('../../assets/icon.png');

type Props = {
  /** Affiche seulement le pictogramme (barres de nav, cartes compactes). */
  compact?: boolean;
  /** Sous-titre sous le mot « Husko » (défaut : sandwicherie client). */
  tagline?: string;
};

export function BrandMark({ compact, tagline = VENUE_TAGLINE_CLIENT }: Props) {
  const side = compact ? 44 : 72;
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Image
        source={ICON}
        resizeMode="contain"
        style={[styles.icon, { width: side, height: side, borderRadius: compact ? radius.sm : radius.md }]}
        accessibilityLabel="Logo Husko"
      />
      {!compact ? (
        <View style={styles.textCol}>
          <Text style={typography.heroBrand}>Husko</Text>
          <Text style={typography.heroTagline}>{tagline}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  wrapCompact: {
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  icon: {
    borderWidth: 1,
    borderColor: colors.borderGlow,
    backgroundColor: colors.shellBackground,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowPure,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  textCol: { alignItems: 'center', marginTop: spacing.sm },
});
