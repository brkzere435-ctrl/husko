import { useCallback, useEffect, useRef } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CLIENT_BOOT_HERO } from '@/constants/brandingAssets';
import { CLIENT_BOOT_DURATION_MS, CLIENT_BOOT_SKIP_HINT } from '@/constants/clientExperience';
import { FONT } from '@/constants/fonts';
import { colors, spacing } from '@/constants/theme';
import { postCursorDebugIngest } from '@/utils/cursorDebugIngest';

const BOOT_CONTENT_OFFSET = spacing.lg;
export const CLIENT_BOOT_VISUAL_VERSION = '2026-04-08-flyer-fullscreen-v1';
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

  const emitBootLog = useCallback(
    (hypothesisId: 'H1' | 'H2', location: string, message: string, data: Record<string, unknown>) => {
      // #region agent log
      postCursorDebugIngest({
        runId: `boot-${Date.now().toString(36)}`,
        hypothesisId,
        location,
        message,
        data,
      });
      // #endregion
    },
    []
  );

  const finish = useCallback((reason: 'timer' | 'press') => {
    emitBootLog('H1', 'ClientBootOverlay.tsx:finish', 'boot overlay finish', { variant, reason });
    doneRef.current();
  }, [emitBootLog, variant]);

  useEffect(() => {
    if (!visible) return;
    emitBootLog('H1', 'ClientBootOverlay.tsx:useEffect', 'boot overlay visible', {
      variant,
      durationMs: CLIENT_BOOT_DURATION_MS,
    });
    const t = setTimeout(() => finish('timer'), CLIENT_BOOT_DURATION_MS);
    return () => clearTimeout(t);
  }, [visible, finish, emitBootLog, variant]);

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
        onPress={() => finish('press')}
        accessibilityRole="button"
        accessibilityLabel={`${CLIENT_BOOT_SKIP_HINT}. Ouvre l'application.`}
      >
        <Image
          source={CLIENT_BOOT_HERO}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          blurRadius={10}
          onLoad={() =>
            emitBootLog('H2', 'ClientBootOverlay.tsx:bgImage:onLoad', 'boot background image loaded', { variant })
          }
          onError={(e) =>
            emitBootLog('H2', 'ClientBootOverlay.tsx:bgImage:onError', 'boot background image failed', {
              variant,
              error: String(e?.nativeEvent?.error ?? 'unknown'),
            })
          }
        />
        <View style={styles.backTint} pointerEvents="none" />
        <View style={[styles.fill, { paddingTop: topPad }]}>
          <View style={styles.posterWrap} pointerEvents="none">
            <Image
              source={CLIENT_BOOT_HERO}
              style={styles.poster}
              resizeMode="contain"
              onLoad={() =>
                emitBootLog('H2', 'ClientBootOverlay.tsx:poster:onLoad', 'boot poster image loaded', { variant })
              }
              onError={(e) =>
                emitBootLog('H2', 'ClientBootOverlay.tsx:poster:onError', 'boot poster image failed', {
                  variant,
                  error: String(e?.nativeEvent?.error ?? 'unknown'),
                })
              }
            />
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
  poster: {
    width: '100%',
    maxWidth: 420,
    height: '100%',
    maxHeight: 760,
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
