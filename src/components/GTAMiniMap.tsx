import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { GTAHudFrame } from '@/components/GTAHudFrame';
import { GTAMiniMapFallbackInterior } from '@/components/GTAMiniMapFallbackInterior';
import { HuskoDepartureBuilding } from '@/components/HuskoDepartureBuilding';
import { HUSKO_DEPARTURE_HUB } from '@/constants/huskoDepartureHub';
import { mapDarkStyle } from '@/constants/mapDarkStyle';
import { colors, elevation } from '@/constants/theme';
import type { MapRegion } from '@/types/mapRegion';
import { isMapsKeyConfiguredForPlatform } from '@/utils/mapsBuildInfo';

import { CarMarkerIcon } from './CarMarkerIcon';

type Props = {
  region: MapRegion;
  driver?: { latitude: number; longitude: number } | null;
  headingDeg?: number;
  dest?: { latitude: number; longitude: number } | null;
  showDest?: boolean;
  departure?: { latitude: number; longitude: number } | null;
  showDeparture?: boolean;
  hudFooter?: string;
};

const HUD_SIZE = 172;

export function GTAMiniMap({
  region,
  driver,
  headingDeg = 0,
  dest,
  showDest,
  departure = HUSKO_DEPARTURE_HUB,
  showDeparture = true,
  hudFooter = 'LONG BEACH · CADILLAC SUIVI',
}: Props) {
  const mapsConfigured = isMapsKeyConfiguredForPlatform();
  const useFallback = !mapsConfigured;
  const useGoogleStyle = Platform.OS === 'android';

  if (useFallback) {
    return (
      <View style={elevation.hero}>
        <GTAHudFrame size={HUD_SIZE} footerTag={hudFooter}>
          <GTAMiniMapFallbackInterior
            driver={driver}
            headingDeg={headingDeg}
            dest={dest}
            showDest={showDest}
            departure={departure}
            showDeparture={showDeparture}
          />
        </GTAHudFrame>
      </View>
    );
  }

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
          {showDeparture && departure ? (
            <Marker
              coordinate={departure}
              anchor={{ x: 0.5, y: 1 }}
              zIndex={1}
              tracksViewChanges={false}
              title="Husko · QG"
            >
              <HuskoDepartureBuilding size={48} />
            </Marker>
          ) : null}
          {showDest && dest ? (
            <Marker coordinate={dest} zIndex={2} pinColor={colors.accent} title="Livraison" />
          ) : null}
          {driver ? (
            <Marker coordinate={driver} anchor={{ x: 0.5, y: 0.5 }} zIndex={3} tracksViewChanges={false}>
              <CarMarkerIcon headingDeg={headingDeg} size={38} variant="lowrider" />
            </Marker>
          ) : null}
        </MapView>
      </GTAHudFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { ...StyleSheet.absoluteFillObject },
});
