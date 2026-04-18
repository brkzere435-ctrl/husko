import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { FONT } from '@/constants/fonts';
import { gtaHudFrameVisual } from '@/constants/hudVisual';
import { colors, radius, spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';

type Props = {
  children: ReactNode;
  /** Taille du bloc carte (carré). */
  size?: number;
  style?: ViewStyle;
  /** Bandeau bas (humour West Coast / suivi). */
  footerTag?: string;
};

/** Encadrement type HUD GTA : néon cyan/or, équerres, scanlines, bandeau. */
export function GTAHudFrame({ children, size = 156, style, footerTag = 'WESTSIDE · SUIVI LIVE' }: Props) {
  const corner = 18;
  const t = 3;
  return (
    <View style={[styles.root, { width: size, height: size }, style]}>
      <LinearGradient
        colors={[...gtaHudFrameVisual.borderGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.neonBorder, { borderRadius: radius.lg }]}
      >
        <View style={[styles.inner, { borderRadius: radius.lg - 2 }]}>
          {/* Équerres coin — style radar GTA */}
          <View style={[styles.bracket, styles.tl, { borderTopWidth: t, borderLeftWidth: t, width: corner, height: corner }]} />
          <View
            style={[styles.bracket, styles.tr, { borderTopWidth: t, borderRightWidth: t, width: corner, height: corner }]}
          />
          <View
            style={[styles.bracket, styles.bl, { borderBottomWidth: t, borderLeftWidth: t, width: corner, height: corner }]}
          />
          <View
            style={[styles.bracket, styles.br, { borderBottomWidth: t, borderRightWidth: t, width: corner, height: corner }]}
          />

          <View style={styles.mapSlot} collapsable={false}>
            {children}
          </View>

          {/* Scanlines */}
          <View style={styles.scanOverlay} pointerEvents="none">
            {Array.from({ length: 14 }).map((_, i) => (
              <View key={i} style={[styles.scanLine, { top: i * 11 }]} />
            ))}
          </View>

          <View style={styles.topHud}>
            <Text style={styles.hudMini}>GPS</Text>
            <Text style={styles.hudCompass}>▲</Text>
          </View>
          <View style={styles.bottomHud}>
            <Text style={styles.hudFooter} numberOfLines={2}>
              {footerTag}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.lg,
  },
  neonBorder: {
    padding: 2,
    borderRadius: radius.lg,
  },
  inner: {
    flex: 1,
    /** Moins « trou noir » que hudVoid si le slot carte rend 0 px (Android). */
    backgroundColor: colors.mapRadarBg,
    overflow: 'hidden',
  },
  bracket: {
    position: 'absolute',
    borderColor: WC.neonCyan,
    zIndex: 6,
    opacity: 0.95,
  },
  tl: { top: 5, left: 5 },
  tr: { top: 5, right: 5 },
  bl: { bottom: 22, left: 5 },
  br: { bottom: 22, right: 5 },
  /** Slot carte — bottom explicite (évite hauteur 0 sur certains Android avec margin + fill). */
  mapSlot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
    opacity: 0.14,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: gtaHudFrameVisual.scanLine,
  },
  topHud: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    zIndex: 5,
  },
  hudMini: {
    fontFamily: FONT.bold,
    color: WC.gold,
    fontSize: 9,
    letterSpacing: 2,
    textShadowColor: colors.shadowPure,
    textShadowRadius: 3,
  },
  hudCompass: {
    fontFamily: FONT.bold,
    color: WC.neonCyan,
    fontSize: 10,
  },
  bottomHud: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: gtaHudFrameVisual.footerBarBg,
    borderTopWidth: 1,
    borderTopColor: gtaHudFrameVisual.footerBarBorderTop,
    paddingVertical: 3,
    paddingHorizontal: 4,
    zIndex: 5,
  },
  hudFooter: {
    fontFamily: FONT.bold,
    color: WC.gold,
    fontSize: 8,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});
