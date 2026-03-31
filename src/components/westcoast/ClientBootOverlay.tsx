import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WC } from '@/constants/westCoastTheme';
import { spacing } from '@/constants/theme';

const BOOT_CONTENT_OFFSET = spacing.lg;

type Props = {
  visible: boolean;
  onDone: () => void;
};

/** Écran d’accueil client — scène « camion + silhouette » façon affiche West Coast. */
export function ClientBootOverlay({ visible, onDone }: Props) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  if (!visible) return null;

  const topPad = insets.top + BOOT_CONTENT_OFFSET;

  return (
    <Modal visible animationType="fade" statusBarTranslucent transparent>
      <LinearGradient
        colors={['#0a0204', '#4c0510', '#0f172a', '#1a0508']}
        style={[styles.fill, { paddingTop: topPad }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      >
        <View style={styles.brickTexture} />
        <View style={styles.neonTop} />
        <Text style={styles.kicker}>HUSKO · BY NIGHT</Text>
        <Text style={styles.headline}>LE PLUS RAPIDE DES{'\n'}MEILLEURS KEBABS</Text>
        <Text style={styles.script}>d&apos;Angers</Text>

        <View style={styles.scene}>
          <View style={styles.truckGlow}>
            <MaterialCommunityIcons name="truck" size={118} color={WC.neonCyan} style={styles.truckIcon} />
            <View style={styles.headlightL} />
            <View style={styles.headlightR} />
          </View>
          <View style={styles.person}>
            <Ionicons name="person" size={72} color={WC.gold} />
          </View>
        </View>

        <Text style={styles.banner}>LA RECETTE QUI DOMINE LA VILLE</Text>
        <Text style={styles.hours}>LIVRAISON LUN – SAM · 20h – 00h</Text>
        <Text style={styles.snap}>Snap · HUSKOBYNIGHT</Text>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'flex-start' },
  brickTexture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
    backgroundColor: '#7f1d1d',
  },
  neonTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: WC.neonCyan,
    opacity: 0.85,
  },
  kicker: {
    color: WC.neonCyan,
    fontWeight: '900',
    letterSpacing: 4,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  headline: {
    color: WC.white,
    fontWeight: '900',
    fontSize: 26,
    lineHeight: 30,
    textAlign: 'center',
    textShadowColor: WC.shadow,
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  script: {
    marginTop: spacing.sm,
    color: '#fca5a5',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scene: {
    marginTop: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  truckGlow: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: WC.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 28,
  },
  truckIcon: {
    opacity: 0.95,
  },
  headlightL: {
    position: 'absolute',
    left: 18,
    bottom: 28,
    width: 22,
    height: 14,
    borderRadius: 6,
    backgroundColor: '#fde047',
    opacity: 0.95,
  },
  headlightR: {
    position: 'absolute',
    right: 18,
    bottom: 28,
    width: 22,
    height: 14,
    borderRadius: 6,
    backgroundColor: '#fde047',
    opacity: 0.95,
  },
  person: {
    position: 'absolute',
    right: 36,
    bottom: -8,
    opacity: 0.98,
  },
  banner: {
    marginTop: spacing.xl,
    color: WC.white,
    fontWeight: '800',
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 1,
    opacity: 0.95,
  },
  hours: {
    marginTop: spacing.md,
    color: WC.gold,
    fontWeight: '900',
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  snap: {
    marginTop: spacing.lg,
    color: WC.neonCyan,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
