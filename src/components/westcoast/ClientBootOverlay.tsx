import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { BrandMark } from '@/components/BrandMark';
import { CLIENT_BOOT_HERO } from '@/constants/brandingAssets';
import {
  CLIENT_BOOT_DURATION_MS,
  CLIENT_BOOT_SKIP_HINT,
} from '@/constants/clientExperience';
import { clientBootVisual } from '@/constants/clientBootVisual';
import { FONT } from '@/constants/fonts';
import { colors, spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';

const BOOT_CONTENT_OFFSET = spacing.lg;

type Props = {
  visible: boolean;
  onDone: () => void;
};

/** Écran d’accueil client — fond sunset + scène icônes façon affiche West Coast. */
export function ClientBootOverlay({ visible, onDone }: Props) {
  const insets = useSafeAreaInsets();
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const finish = useCallback(() => {
    doneRef.current();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(finish, CLIENT_BOOT_DURATION_MS);
    return () => clearTimeout(t);
  }, [visible, finish]);

  if (!visible) return null;

  const topPad = insets.top + BOOT_CONTENT_OFFSET;

  return (
    <Modal
      visible
      animationType="fade"
      statusBarTranslucent
      transparent
      accessibilityViewIsModal
    >
      <Pressable
        style={styles.root}
        onPress={finish}
        accessibilityRole="button"
        accessibilityLabel={`${CLIENT_BOOT_SKIP_HINT}. Ouvre le menu.`}
      >
        <Image source={CLIENT_BOOT_HERO} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient
          colors={[...clientBootVisual.overlayGradient]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <LinearGradient
          colors={[...clientBootVisual.tintGradient]}
          locations={[0, 0.28, 0.55, 1]}
          style={[StyleSheet.absoluteFill, styles.tint]}
          pointerEvents="none"
        />
        <View style={[styles.fill, { paddingTop: topPad }]}>
          <View style={styles.brickTexture} />
          <View style={styles.neonTop} />
          <View style={styles.huskoStamp}>
            <Ionicons name="flash" size={14} color={WC.gold} />
            <Text style={styles.huskoStampText}>HUSKO</Text>
            <Ionicons name="flash" size={14} color={WC.gold} />
          </View>
          <Text style={styles.kicker}>HUSKO · BY NIGHT</Text>
          <Text style={styles.headline}>LE PLUS RAPIDE DES{'\n'}MEILLEURS KEBABS</Text>
          <Text style={styles.script}>Angers · livraison nocturne</Text>

          <View style={styles.scene}>
            <BrandMark compact />
          </View>
          <View style={styles.rolesRow}>
            <View style={styles.roleChip}>
              <Ionicons name="briefcase-outline" size={14} color={WC.neonCyan} />
              <Text style={styles.roleChipText}>GERANT</Text>
            </View>
            <View style={styles.roleChip}>
              <Ionicons name="person-outline" size={14} color={WC.neonCyan} />
              <Text style={styles.roleChipText}>CLIENT</Text>
            </View>
            <View style={styles.roleChip}>
              <Ionicons name="car-sport-outline" size={14} color={WC.neonCyan} />
              <Text style={styles.roleChipText}>LIVREUR</Text>
            </View>
          </View>

          <Text style={styles.banner}>LA RECETTE QUI DOMINE LA VILLE</Text>
          <Text style={styles.hours}>LIVRAISON LUN – SAM · 20h – 00h</Text>
          <Text style={styles.snap}>Snap · HUSKOBYNIGHT</Text>
          <Text style={styles.skipHint}>{CLIENT_BOOT_SKIP_HINT}</Text>
          <LinearGradient
            colors={[...clientBootVisual.vignetteGradient]}
            locations={[0, 0.4, 1]}
            style={styles.bootVignette}
            pointerEvents="none"
          />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.shellBackground },
  tint: { opacity: 0.38 },
  fill: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'flex-start',
  },
  brickTexture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
    backgroundColor: colors.bootBrickTexture,
  },
  neonTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: WC.flyerCrimson,
    opacity: 0.9,
  },
  huskoStamp: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(252,211,77,0.5)',
    backgroundColor: 'rgba(5, 6, 10, 0.55)',
    marginBottom: spacing.md,
  },
  huskoStampText: {
    fontFamily: FONT.bold,
    color: WC.white,
    fontSize: 12,
    letterSpacing: 2.6,
  },
  kicker: {
    fontFamily: FONT.bold,
    color: 'rgba(252, 211, 77, 0.95)',
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
    color: clientBootVisual.script,
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: 0.6,
  },
  scene: {
    marginTop: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  rolesRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.35)',
    backgroundColor: 'rgba(9,12,18,0.45)',
  },
  roleChipText: {
    fontFamily: FONT.bold,
    color: 'rgba(255,255,255,0.94)',
    fontSize: 10,
    letterSpacing: 1,
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
    color: 'rgba(252, 211, 77, 0.9)',
    fontSize: 12,
    textAlign: 'center',
  },
  skipHint: {
    fontFamily: FONT.medium,
    marginTop: spacing.md,
    color: clientBootVisual.skipHint,
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  bootVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '42%',
  },
});
