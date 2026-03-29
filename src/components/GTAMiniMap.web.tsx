import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { MapRegion } from '@/types/mapRegion';

import { CarMarkerIcon } from './CarMarkerIcon';

type Props = {
  region: MapRegion;
  driver?: { latitude: number; longitude: number } | null;
  headingDeg?: number;
  dest?: { latitude: number; longitude: number } | null;
  showDest?: boolean;
};

/** Sur le web, pas de MapView natif : aperçu style mini-carte + marqueurs. */
export function GTAMiniMap({ region: _region, driver, headingDeg = 0, dest, showDest }: Props) {
  return (
    <View style={styles.shell}>
      <View style={styles.cornerBracket} />
      <View style={styles.fakeMap}>
        <View style={styles.gridLine} />
        <View style={[styles.gridLine, styles.gridV]} />
        {driver ? (
          <View style={styles.markerWrap}>
            <CarMarkerIcon headingDeg={headingDeg} size={36} />
          </View>
        ) : null}
        {showDest && dest ? (
          <View style={styles.destDot}>
            <Text style={styles.destX}>×</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.label}>
        <Text style={styles.north}>N</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: 140,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.goldDim,
    backgroundColor: colors.bg,
  },
  cornerBracket: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 12,
    opacity: 0.35,
    margin: 3,
    zIndex: 2,
  },
  fakeMap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a0c0c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: 'rgba(240,208,80,0.12)',
  },
  gridV: {
    left: '50%',
    right: undefined,
    top: 0,
    bottom: 0,
    width: 1,
    height: '100%',
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
  label: {
    position: 'absolute',
    top: 6,
    right: 8,
    zIndex: 3,
  },
  north: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
    textShadowColor: '#000',
    textShadowRadius: 4,
  },
});
