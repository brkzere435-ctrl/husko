import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { mapDarkStyle } from '@/constants/mapDarkStyle';
import { colors, elevation } from '@/constants/theme';
import type { MapRegion } from '@/types/mapRegion';

import { CarMarkerIcon } from './CarMarkerIcon';

type Props = {
  region: MapRegion;
  driver?: { latitude: number; longitude: number } | null;
  headingDeg?: number;
  dest?: { latitude: number; longitude: number } | null;
  showDest?: boolean;
};

export function GTAMiniMap({ region, driver, headingDeg = 0, dest, showDest }: Props) {
  const useGoogleStyle = Platform.OS === 'android';

  return (
    <View style={[styles.shell, elevation.hero]}>
      <View style={styles.cornerBracket} />
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        region={region}
        rotateEnabled={false}
        pitchEnabled={false}
        scrollEnabled={false}
        zoomEnabled={false}
        customMapStyle={useGoogleStyle ? mapDarkStyle : undefined}
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
      >
        {driver ? (
          <Marker coordinate={driver} anchor={{ x: 0.5, y: 0.5 }}>
            <CarMarkerIcon headingDeg={headingDeg} size={36} />
          </Marker>
        ) : null}
        {showDest && dest ? (
          <Marker coordinate={dest} pinColor={colors.accent} title="Livraison" />
        ) : null}
      </MapView>
      <View style={styles.scan} pointerEvents="none" />
      <View style={styles.label}>
        <Text style={styles.north}>N</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: 148,
    height: 148,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.borderGlow,
    backgroundColor: colors.bg,
  },
  cornerBracket: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 14,
    opacity: 0.35,
    margin: 3,
    zIndex: 2,
  },
  map: { ...StyleSheet.absoluteFillObject },
  scan: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderWidth: 0,
    opacity: 0.08,
  },
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
