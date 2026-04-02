import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CLIENT_BOOT_HERO } from '@/constants/brandingAssets';
import { FONT } from '@/constants/fonts';
import { spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';

const BOOT_CONTENT_OFFSET = spacing.lg;

type Props = {
  visible: boolean;
  onDone: () => void;
};

/** Écran d’accueil client — fond sunset + scène icônes façon affiche West Coast. */
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
      <View style={styles.root} accessibilityViewIsModal>
        <Image source={CLIENT_BOOT_HERO} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(12,4,8,0.45)', 'rgba(28,8,12,0.55)', 'rgba(4,1,2,0.88)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['#1a0a28', '#7c2d12', '#ea580c', '#0c0305']}
          locations={[0, 0.28, 0.55, 1]}
          style={[StyleSheet.absoluteFill, styles.tint]}
          pointerEvents="none"
        />
        <View style={[styles.fill, { paddingTop: topPad }]}>
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
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.72)']}
            locations={[0, 0.4, 1]}
            style={styles.bootVignette}
            pointerEvents="none"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0305' },
  tint: { opacity: 0.42 },
  fill: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'flex-start',
  },
  brickTexture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
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
    fontFamily: FONT.bold,
    color: WC.neonCyan,
    letterSpacing: 4,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  headline: {
    fontFamily: FONT.bold,
    color: WC.white,
    fontSize: 26,
    lineHeight: 30,
    textAlign: 'center',
    textShadowColor: WC.shadow,
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  script: {
    fontFamily: FONT.medium,
    marginTop: spacing.sm,
    color: '#fef3c7',
    fontSize: 28,
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
    fontFamily: FONT.bold,
    marginTop: spacing.xl,
    color: WC.white,
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 1,
    opacity: 0.95,
  },
  hours: {
    fontFamily: FONT.bold,
    marginTop: spacing.md,
    color: WC.gold,
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  snap: {
    fontFamily: FONT.medium,
    marginTop: spacing.lg,
    color: WC.neonCyan,
    fontSize: 12,
    textAlign: 'center',
  },
  bootVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '42%',
  },
});
