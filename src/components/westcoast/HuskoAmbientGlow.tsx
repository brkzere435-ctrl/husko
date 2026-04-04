import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { westCoastAmbientVisual } from '@/constants/westCoastAmbientVisual';

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
        colors={[...westCoastAmbientVisual.vignetteGradient]}
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
  /** Haut-gauche — halo pêche / corail sunset */
  orbRose: {
    width: 320,
    height: 320,
    top: -80,
    left: -100,
    backgroundColor: westCoastAmbientVisual.orbRose,
    transform: [{ scaleX: 1.15 }],
  },
  /** Centre-droit — reflet ciel crépusculaire (lavande / cyan doux) */
  orbCyan: {
    width: 220,
    height: 220,
    top: '28%',
    right: -70,
    backgroundColor: westCoastAmbientVisual.orbCyan,
    opacity: 0.55,
  },
  /** Bas — halo miel / golden hour */
  orbGold: {
    width: 280,
    height: 200,
    bottom: -60,
    left: '12%',
    backgroundColor: westCoastAmbientVisual.orbGold,
  },
  /** Assombrit légèrement les bords pour centrer le regard */
  vignette: {
    ...StyleSheet.absoluteFillObject,
  },
});
