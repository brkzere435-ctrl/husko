import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { WC } from '@/constants/westCoastTheme';

/**
 * Halos doux en fond (bokeh) — ajoute de la profondeur sans images lourdes.
 * Reste sous le contenu ; ne capte pas les touches.
 */
export function HuskoAmbientGlow() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={[styles.orb, styles.orbRose]} />
      <View style={[styles.orb, styles.orbCyan]} />
      <View style={[styles.orb, styles.orbGold]} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.55)']}
        locations={[0, 0.55, 1]}
        style={styles.vignette}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  /** Haut-gauche — chaleur brique / rose */
  orbRose: {
    width: 320,
    height: 320,
    top: -80,
    left: -100,
    backgroundColor: 'rgba(220, 38, 38, 0.14)',
    transform: [{ scaleX: 1.15 }],
  },
  /** Centre-droit — reflet néon */
  orbCyan: {
    width: 220,
    height: 220,
    top: '28%',
    right: -70,
    backgroundColor: WC.neonCyanDim,
    opacity: 0.45,
  },
  /** Bas — halo or */
  orbGold: {
    width: 280,
    height: 200,
    bottom: -60,
    left: '12%',
    backgroundColor: 'rgba(253, 230, 138, 0.07)',
  },
  /** Assombrit légèrement les bords pour centrer le regard */
  vignette: {
    ...StyleSheet.absoluteFillObject,
  },
});
