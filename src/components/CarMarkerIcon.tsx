import React from 'react';
import { View, StyleSheet } from 'react-native';

import { colors } from '@/constants/theme';

type Props = { size?: number; headingDeg?: number };

/** Silhouette vue du dessus type berline US (Impala / Cadillac) */
export function CarMarkerIcon({ size = 44, headingDeg = 0 }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size * 1.6, transform: [{ rotate: `${headingDeg}deg` }] }]}>
      <View style={[styles.hood, { width: size * 0.85 }]} />
      <View style={[styles.cabin, { width: size * 0.95, height: size * 0.55 }]} />
      <View style={[styles.trunk, { width: size * 0.8 }]} />
      <View style={[styles.wheel, styles.wl]} />
      <View style={[styles.wheel, styles.wr]} />
      <View style={[styles.wheel, styles.bl]} />
      <View style={[styles.wheel, styles.br]} />
      <View style={styles.strip} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  hood: {
    height: 14,
    backgroundColor: '#1c1c1c',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  cabin: {
    backgroundColor: '#2a1515',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  trunk: {
    height: 12,
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  wheel: {
    position: 'absolute',
    width: 8,
    height: 14,
    backgroundColor: '#0a0a0a',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#333',
  },
  wl: { top: 10, left: 2 },
  wr: { top: 10, right: 2 },
  bl: { bottom: 10, left: 2 },
  br: { bottom: 10, right: 2 },
  strip: {
    position: 'absolute',
    width: '55%',
    height: 3,
    backgroundColor: colors.accent,
    opacity: 0.9,
    top: '46%',
    borderRadius: 2,
  },
});
