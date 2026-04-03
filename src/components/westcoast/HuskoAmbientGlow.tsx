import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

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
        colors={['transparent', 'rgba(45, 28, 40, 0.22)', 'rgba(28, 18, 26, 0.38)']}
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
    backgroundColor: 'rgba(251, 146, 60, 0.14)',
    transform: [{ scaleX: 1.15 }],
  },
  /** Centre-droit — reflet ciel crépusculaire (lavande / cyan doux) */
  orbCyan: {
    width: 220,
    height: 220,
    top: '28%',
    right: -70,
    backgroundColor: 'rgba(167, 139, 250, 0.12)',
    opacity: 0.55,
  },
  /** Bas — halo miel / golden hour */
  orbGold: {
    width: 280,
    height: 200,
    bottom: -60,
    left: '12%',
    backgroundColor: 'rgba(253, 224, 71, 0.09)',
  },
  /** Assombrit légèrement les bords pour centrer le regard */
  vignette: {
    ...StyleSheet.absoluteFillObject,
  },
});
