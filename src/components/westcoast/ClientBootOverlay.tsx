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
import { colors, radius, spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';

const BOOT_CONTENT_OFFSET = spacing.lg;
export const CLIENT_BOOT_VISUAL_VERSION = '2026-04-08-cinematic-v2';
type BootVariant = 'client' | 'gerant' | 'livreur';

type Props = {
  visible: boolean;
  onDone: () => void;
  variant?: BootVariant;
};

const OVERLAY_COPY: Record<
  BootVariant,
  {
    kicker: string;
    headline: string;
    script: string;
    caption: string;
    banner: string;
    roleChips: { icon: keyof typeof Ionicons.glyphMap; label: string }[];
  }
> = {
  client: {
    kicker: 'LOS ANGELES VIBES',
    headline: 'HUSKO CLIENT',
    script: 'Commande premium · suivi en temps reel',
    caption: 'CLIENT EXPERIENCE · WEST COAST STYLE',
    banner: 'LIVRAISON LUN - SAM · 20h - 00h',
    roleChips: [
      { icon: 'person-outline', label: 'CLIENT' },
      { icon: 'car-sport-outline', label: 'SUIVI LIVE' },
    ],
  },
  gerant: {
    kicker: 'KITCHEN COMMAND',
    headline: 'HUSKO GERANT',
    script: 'Pilotage commandes · coordination service',
    caption: 'MANAGER CONSOLE · SERVICE EN TEMPS REEL',
    banner: 'TABLEAU DE BORD · PREPA · LIVRAISON',
    roleChips: [
      { icon: 'briefcase-outline', label: 'GERANT' },
      { icon: 'layers-outline', label: 'ORCHESTRATION' },
    ],
  },
  livreur: {
    kicker: 'NIGHT DRIVER',
    headline: 'HUSKO LIVREUR',
    script: 'Navigation course · remontee GPS live',
    caption: 'DRIVER HUD · TRACKING EN TEMPS REEL',
    banner: 'PRISE EN CHARGE · COURSE · LIVRAISON',
    roleChips: [
      { icon: 'car-sport-outline', label: 'LIVREUR' },
      { icon: 'navigate-outline', label: 'GPS LIVE' },
    ],
  },
};

/** Écran d’accueil client — fond sunset + scène icônes façon affiche West Coast. */
export function ClientBootOverlay({ visible, onDone, variant = 'client' }: Props) {
  const insets = useSafeAreaInsets();
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const copy = OVERLAY_COPY[variant];

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
        accessibilityLabel={`${CLIENT_BOOT_SKIP_HINT}. Ouvre l'application.`}
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
          <View style={styles.palmLayerLeft} pointerEvents="none" />
          <View style={styles.palmLayerRight} pointerEvents="none" />
          <View style={styles.huskoStamp}>
            <Ionicons name="flash" size={14} color={WC.gold} />
            <Text style={styles.huskoStampText}>HUSKO</Text>
            <Ionicons name="flash" size={14} color={WC.gold} />
          </View>
          <Text style={styles.kicker}>{copy.kicker}</Text>
          <Text style={styles.headline}>{copy.headline}</Text>
          <Text style={styles.script}>{copy.script}</Text>

          <View style={styles.scene}>
            <BrandMark compact />
          </View>
          <View style={styles.glassCard}>
            <View style={styles.rolesRow}>
              {copy.roleChips.map((chip) => (
                <View key={chip.label} style={styles.roleChip}>
                  <Ionicons name={chip.icon} size={14} color={WC.neonCyan} />
                  <Text style={styles.roleChipText}>{chip.label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.cardCaption}>{copy.caption}</Text>
          </View>
          <Text style={styles.banner}>{copy.banner}</Text>
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
  palmLayerLeft: {
    position: 'absolute',
    left: -20,
    bottom: 140,
    width: 110,
    height: 220,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 18,
    backgroundColor: 'rgba(7, 9, 18, 0.35)',
    transform: [{ rotate: '-6deg' }],
  },
  palmLayerRight: {
    position: 'absolute',
    right: -20,
    bottom: 128,
    width: 110,
    height: 220,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 90,
    backgroundColor: 'rgba(7, 9, 18, 0.35)',
    transform: [{ rotate: '6deg' }],
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
    letterSpacing: 3.2,
    fontSize: 10,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  headline: {
    fontFamily: FONT.bold,
    color: WC.white,
    fontSize: 42,
    lineHeight: 46,
    textAlign: 'center',
    textShadowColor: WC.shadow,
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 4,
    letterSpacing: 2,
  },
  script: {
    fontFamily: FONT.medium,
    marginTop: spacing.xs,
    color: clientBootVisual.script,
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 1,
  },
  scene: {
    marginTop: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  glassCard: {
    marginTop: spacing.md,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 360,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(252,211,77,0.24)',
    backgroundColor: 'rgba(8, 10, 18, 0.46)',
  },
  rolesRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.35)',
    backgroundColor: 'rgba(9,12,18,0.58)',
  },
  roleChipText: {
    fontFamily: FONT.bold,
    color: 'rgba(255,255,255,0.94)',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  cardCaption: {
    marginTop: spacing.sm,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.86)',
    fontFamily: FONT.medium,
    fontSize: 10,
    letterSpacing: 1.1,
  },
  banner: {
    fontFamily: FONT.bold,
    marginTop: spacing.lg,
    color: WC.white,
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 1.2,
    opacity: 0.9,
  },
  snap: {
    fontFamily: FONT.medium,
    marginTop: spacing.sm,
    color: 'rgba(252, 211, 77, 0.78)',
    fontSize: 10,
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
