import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GTAHudFrame } from '@/components/GTAHudFrame';
import { colors } from '@/constants/theme';
import type { MapRegion } from '@/types/mapRegion';

import { CarMarkerIcon } from './CarMarkerIcon';

type Props = {
  region: MapRegion;
  driver?: { latitude: number; longitude: number } | null;
  headingDeg?: number;
  dest?: { latitude: number; longitude: number } | null;
  showDest?: boolean;
  hudFooter?: string;
};

const HUD_SIZE = 172;

/** Web : aperçu + même encadrement GTA que le natif. */
export function GTAMiniMap({
  region: _region,
  driver,
  headingDeg = 0,
  dest,
  showDest,
  hudFooter = 'LONG BEACH · CADILLAC SUIVI',
}: Props) {
  return (
    <GTAHudFrame size={HUD_SIZE} footerTag={hudFooter}>
      <View style={styles.fakeMap}>
        <View style={styles.gridLine} />
        <View style={[styles.gridLine, styles.gridV]} />
        <View style={styles.palmSilhouette} />
        {driver ? (
          <View style={styles.markerWrap}>
            <CarMarkerIcon headingDeg={headingDeg} size={38} variant="lowrider" />
          </View>
        ) : null}
        {showDest && dest ? (
          <View style={styles.destDot}>
            <Text style={styles.destX}>×</Text>
          </View>
        ) : null}
      </View>
    </GTAHudFrame>
  );
}

const styles = StyleSheet.create({
  fakeMap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0d0408',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: 'rgba(34,211,238,0.15)',
  },
  gridV: {
    left: '50%',
    right: undefined,
    top: 0,
    bottom: 0,
    width: 1,
    height: '100%',
  },
  palmSilhouette: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    width: 28,
    height: 36,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.25)',
    opacity: 0.5,
  },
  markerWrap: { zIndex: 4 },
  destDot: {
    position: 'absolute',
    bottom: 24,
    right: 28,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  destX: { color: '#fff', fontWeight: '900', fontSize: 14 },
});
