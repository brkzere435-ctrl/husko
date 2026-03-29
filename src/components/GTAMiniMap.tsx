import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { GTAHudFrame } from '@/components/GTAHudFrame';
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
  /** Bandeau façon HUD (défaut West Coast). */
  hudFooter?: string;
};

const HUD_SIZE = 172;

export function GTAMiniMap({
  region,
  driver,
  headingDeg = 0,
  dest,
  showDest,
  hudFooter = 'LONG BEACH · CADILLAC SUIVI',
}: Props) {
  const useGoogleStyle = Platform.OS === 'android';

  return (
    <View style={elevation.hero}>
      <GTAHudFrame size={HUD_SIZE} footerTag={hudFooter}>
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
              <CarMarkerIcon headingDeg={headingDeg} size={38} variant="lowrider" />
            </Marker>
          ) : null}
          {showDest && dest ? (
            <Marker coordinate={dest} pinColor={colors.accent} title="Livraison" />
          ) : null}
        </MapView>
      </GTAHudFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { ...StyleSheet.absoluteFillObject },
});
