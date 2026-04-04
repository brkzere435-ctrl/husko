import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { FONT } from '@/constants/fonts';
import { WC } from '@/constants/westCoastTheme';
import { colors } from '@/constants/theme';

/**
 * Écran minimal pendant le chargement des polices — évite un blanc vide avant le splash natif masqué.
 */
export function HuskoBootSplash() {
  return (
    <View style={styles.root} accessibilityLabel="Chargement Husko">
      <LinearGradient
        colors={[WC.brickDeep, WC.brick, '#2a1e28']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ActivityIndicator size="large" color={WC.neonCyan} />
      <Text style={styles.brand}>HUSKO</Text>
      <Text style={styles.sub}>By night</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    gap: 12,
  },
  brand: {
    marginTop: 8,
    fontFamily: FONT.bold,
    fontSize: 22,
    letterSpacing: 6,
    color: WC.white,
  },
  sub: {
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 3,
    color: WC.fire,
    opacity: 0.9,
    textTransform: 'uppercase',
  },
});
