import { Image, StyleSheet, View } from 'react-native';

import { CLIENT_BOOT_HERO } from '@/constants/brandingAssets';
import { colors, radius, spacing } from '@/constants/theme';

type Props = {
  height?: number;
};

/** Bandeau visuel lowrider partagé sur les accueils métier. */
export function LowriderHeroStrip({ height = 120 }: Props) {
  return (
    <View style={[styles.wrap, { height }]}>
      <Image source={CLIENT_BOOT_HERO} style={styles.image} resizeMode="cover" />
      <View style={styles.tint} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.md,
    backgroundColor: colors.shellBackground,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 0, 0, 0.34)',
  },
});
