import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';

import { WC } from '@/constants/westCoastTheme';
import { colors } from '@/constants/theme';

type Props = { size?: number; headingDeg?: number; variant?: 'default' | 'lowrider' };

/** Vue du dessus : berline US — mode lowrider = chrome or + néon sous caisse (West Coast). */
export function CarMarkerIcon({ size = 44, headingDeg = 0, variant = 'default' }: Props) {
  const low = variant === 'lowrider';
  return (
    <View
      collapsable={Platform.OS === 'android' ? false : undefined}
      style={[
        styles.wrap,
        {
          width: size,
          height: size * 1.6,
          transform: [{ rotate: `${headingDeg}deg` }],
        },
      ]}
    >
      {low ? <View style={[styles.underglow, { width: size * 1.2, height: size * 0.4 }]} /> : null}
      <View style={[styles.hood, { width: size * 0.85 }, low && styles.chrome]} />
      <View style={[styles.cabin, { width: size * 0.95, height: size * 0.55 }, low && styles.cabinLow]} />
      <View style={[styles.trunk, { width: size * 0.8 }, low && styles.chrome]} />
      <View style={[styles.wheel, styles.wl, low && styles.rimGold]} />
      <View style={[styles.wheel, styles.wr, low && styles.rimGold]} />
      <View style={[styles.wheel, styles.bl, low && styles.rimGold]} />
      <View style={[styles.wheel, styles.br, low && styles.rimGold]} />
      <View style={[styles.strip, low && styles.stripLow]} />
      {low ? <View style={styles.fogL} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  underglow: {
    position: 'absolute',
    bottom: 4,
    borderRadius: 40,
    backgroundColor: WC.neonCyan,
    opacity: 0.45,
    shadowColor: WC.neonCyan,
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  hood: {
    height: 14,
    backgroundColor: colors.carHood,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  chrome: {
    borderColor: WC.gold,
    borderWidth: 2,
    shadowColor: WC.gold,
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  cabin: {
    backgroundColor: colors.carCabin,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  cabinLow: {
    backgroundColor: colors.carCabinLow,
    borderColor: WC.neonCyan,
  },
  trunk: {
    height: 12,
    backgroundColor: colors.carTrunk,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  wheel: {
    position: 'absolute',
    width: 8,
    height: 14,
    backgroundColor: colors.carWheel,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.carWheelBorder,
  },
  rimGold: {
    borderColor: WC.gold,
    backgroundColor: colors.carRimFill,
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
  stripLow: {
    backgroundColor: WC.neonCyan,
    opacity: 0.85,
    height: 4,
  },
  fogL: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.carFogLamp,
    opacity: 0.35,
    bottom: 6,
    left: '42%',
  },
});
