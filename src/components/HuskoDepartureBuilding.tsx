import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { WC } from '@/constants/westCoastTheme';
import { colors } from '@/constants/theme';

type Props = {
  /** Largeur de référence (hauteur adaptée). Défaut ~carte mini-map. */
  size?: number;
};

/**
 * Marqueur carte : bâtiment QG dont la façade forme un **H** néon (tours + pont) — thème West Coast / GTA HUD.
 */
export function HuskoDepartureBuilding({ size = 46 }: Props) {
  const w = size;
  const h = size * 1.22;
  const pad = w * 0.08;
  const tw = w * 0.22;
  const th = h * 0.72;
  const bridgeH = Math.max(10, h * 0.2);
  const bridgeTop = h * 0.36;
  const bridgeLeft = pad + tw;
  const bridgeWidth = Math.max(8, w - 2 * pad - 2 * tw);

  return (
    <View style={[styles.wrap, { width: w, height: h + 6 }]} accessibilityLabel="Départ Husko, bâtiment H">
      <View style={[styles.glow, { width: w * 1.15, height: h * 0.35, bottom: -2 }]} />
      <LinearGradient
        colors={['rgba(8,2,4,0.95)', '#140808', '#0a0404']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.facade, { width: w, height: h }]}
      >
        <View style={[styles.roofLine, { top: 2, left: '6%', right: '6%' }]} />
        {/* H : tour gauche */}
        <LinearGradient
          colors={['#1f0a0c', '#0d0404', '#120606']}
          style={[styles.tower, { width: tw, height: th, left: pad, top: h * 0.12 }]}
        >
          <View style={styles.towerEdgeL} />
          <View style={[styles.windowCol, { left: '18%' }]}>
            <View style={styles.win} />
            <View style={styles.win} />
          </View>
        </LinearGradient>
        {/* H : tour droite */}
        <LinearGradient
          colors={['#1f0a0c', '#0d0404', '#120606']}
          style={[styles.tower, { width: tw, height: th, right: pad, top: h * 0.12 }]}
        >
          <View style={styles.towerEdgeR} />
          <View style={[styles.windowCol, { right: '18%' }]}>
            <View style={styles.win} />
            <View style={styles.win} />
          </View>
        </LinearGradient>
        {/* H : barre centrale (pont) */}
        <LinearGradient
          colors={[WC.neonCyan + '66', '#1a0808', WC.neonCyan + '55']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[
            styles.bridge,
            {
              left: bridgeLeft,
              width: bridgeWidth,
              height: bridgeH,
              top: bridgeTop,
            },
          ]}
        >
          <View style={styles.bridgeNeonTop} />
          <View style={styles.bridgeNeonBottom} />
          <View style={styles.bridgeGoldMid} />
        </LinearGradient>
        {/* Reflets néon sur le H */}
        <View style={[styles.hAccent, { left: pad + 2, top: h * 0.18, height: th * 0.38 }]} />
        <View style={[styles.hAccent, { right: pad + 2, top: h * 0.18, height: th * 0.38 }]} />
        <View style={styles.cornerBoltTL} />
        <View style={styles.cornerBoltTR} />
        <View style={styles.cornerBoltBL} />
        <View style={styles.cornerBoltBR} />
      </LinearGradient>
      <TextMicro width={w} />
    </View>
  );
}

function TextMicro({ width }: { width: number }) {
  return (
    <View style={[styles.hqTag, { maxWidth: width + 8 }]}>
      <View style={styles.hqLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'flex-end' },
  glow: {
    position: 'absolute',
    borderRadius: 40,
    backgroundColor: WC.neonCyan,
    opacity: 0.22,
    shadowColor: WC.neonCyan,
    shadowOpacity: 0.9,
    shadowRadius: 14,
    zIndex: 0,
  },
  facade: {
    borderRadius: 6,
    borderWidth: 2,
    borderColor: WC.neonCyanDim,
    overflow: 'hidden',
    shadowColor: WC.gold,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    zIndex: 1,
  },
  roofLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: colors.gold,
    opacity: 0.85,
    zIndex: 4,
  },
  tower: {
    position: 'absolute',
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: WC.neonCyan,
    overflow: 'hidden',
  },
  towerEdgeL: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: WC.gold,
    opacity: 0.5,
  },
  towerEdgeR: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: WC.gold,
    opacity: 0.5,
  },
  windowCol: {
    position: 'absolute',
    top: '22%',
    flexDirection: 'column',
    gap: 5,
  },
  win: {
    width: 5,
    height: 6,
    borderRadius: 1,
    backgroundColor: 'rgba(34,211,238,0.55)',
    borderWidth: 1,
    borderColor: WC.neonCyan,
  },
  bridge: {
    position: 'absolute',
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: WC.gold,
    justifyContent: 'center',
  },
  bridgeNeonTop: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: 2,
    backgroundColor: WC.neonCyan,
    opacity: 0.9,
  },
  bridgeNeonBottom: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: 2,
    backgroundColor: WC.neonCyan,
    opacity: 0.75,
  },
  bridgeGoldMid: {
    alignSelf: 'center',
    width: '40%',
    height: 2,
    backgroundColor: colors.gold,
    opacity: 0.7,
  },
  hAccent: {
    position: 'absolute',
    width: 3,
    backgroundColor: WC.neonCyan,
    opacity: 0.35,
    borderRadius: 1,
    zIndex: 2,
  },
  cornerBoltTL: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 5,
    height: 5,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: WC.gold,
    zIndex: 5,
  },
  cornerBoltTR: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 5,
    height: 5,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: WC.gold,
    zIndex: 5,
  },
  cornerBoltBL: {
    position: 'absolute',
    bottom: 10,
    left: 4,
    width: 5,
    height: 5,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: WC.neonCyan,
    zIndex: 5,
  },
  cornerBoltBR: {
    position: 'absolute',
    bottom: 10,
    right: 4,
    width: 5,
    height: 5,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: WC.neonCyan,
    zIndex: 5,
  },
  hqTag: {
    marginTop: 2,
    alignItems: 'center',
    width: '100%',
  },
  hqLine: {
    height: 2,
    width: '70%',
    backgroundColor: WC.gold,
    opacity: 0.55,
    borderRadius: 1,
  },
});
