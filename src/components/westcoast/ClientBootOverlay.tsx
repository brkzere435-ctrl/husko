import { useCallback, useEffect, useRef } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CLIENT_BOOT_HERO } from '@/constants/brandingAssets';
import { CLIENT_BOOT_DURATION_MS, CLIENT_BOOT_SKIP_HINT } from '@/constants/clientExperience';
import { FONT } from '@/constants/fonts';
import { colors, spacing } from '@/constants/theme';

const BOOT_CONTENT_OFFSET = spacing.lg;
export const CLIENT_BOOT_VISUAL_VERSION = '2026-04-13-flyer-cropped-premium-v2';
type BootVariant = 'client' | 'gerant' | 'livreur';

type Props = {
  visible: boolean;
  onDone: () => void;
  variant?: BootVariant;
};

const VARIANT_LABEL: Record<BootVariant, string> = {
  client: 'client',
  gerant: 'gerant',
  livreur: 'livreur',
};

/** Splash plein écran commun aux 3 APK, basé sur l'affiche fournie. */
export function ClientBootOverlay({ visible, onDone, variant = 'client' }: Props) {
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
        accessibilityLabel={`${CLIENT_BOOT_SKIP_HINT}. Ouvre l'application.`}
      >
        <Image source={CLIENT_BOOT_HERO} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={10} />
        <View style={styles.backTint} pointerEvents="none" />
        <View style={[styles.fill, { paddingTop: topPad }]}>
          <View style={styles.posterWrap} pointerEvents="none">
            <View style={styles.posterViewport}>
              <Image source={CLIENT_BOOT_HERO} style={styles.posterCrop} resizeMode="cover" />
            </View>
          </View>
          <View style={styles.bottomPanel}>
            <Text style={styles.roleText}>APK {VARIANT_LABEL[variant].toUpperCase()}</Text>
            <Text style={styles.skipHint}>{CLIENT_BOOT_SKIP_HINT}</Text>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.shellBackground },
  backTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14, 2, 2, 0.58)',
  },
  fill: {
    flex: 1,
    paddingHorizontal: spacing.md,
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
  },
  posterWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  posterViewport: {
    width: '100%',
    maxWidth: 420,
    aspectRatio: 9 / 16,
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  posterCrop: {
    width: '132%',
    height: '124%',
    marginLeft: '-16%',
    marginTop: '-10%',
  },
  bottomPanel: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  roleText: {
    fontFamily: FONT.bold,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11,
    letterSpacing: 1.3,
  },
  skipHint: {
    fontFamily: FONT.medium,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
