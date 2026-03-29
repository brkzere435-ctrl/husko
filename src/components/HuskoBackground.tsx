import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Fond en dégradé + léger halo haut + vignette bas — base visuelle commune. */
export function HuskoBackground({ children, style }: Props) {
  return (
    <LinearGradient
      colors={[...colors.gradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.fill, style]}
    >
      <LinearGradient
        colors={['rgba(240, 208, 80, 0.07)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.topGlow}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)']}
        style={styles.bottomVignette}
        pointerEvents="none"
      />
      <View style={styles.dim} pointerEvents="none" />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
  },
  bottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '38%',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
});
