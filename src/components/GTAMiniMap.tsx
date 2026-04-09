import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { GTAHudFrame } from '@/components/GTAHudFrame';
import { GTAMiniMapFallbackInterior } from '@/components/GTAMiniMapFallbackInterior';
import { HuskoDepartureBuilding } from '@/components/HuskoDepartureBuilding';
import { HUSKO_DEPARTURE_HUB } from '@/constants/huskoDepartureHub';
import { mapDarkStyle } from '@/constants/mapDarkStyle';
import { colors, elevation } from '@/constants/theme';
import { useTracksViewChangesForCustomMarker } from '@/hooks/useTracksViewChangesForCustomMarker';
import type { MapRegion } from '@/types/mapRegion';

import { CarMarkerIcon } from './CarMarkerIcon';

type Props = {
  region: MapRegion;
  size?: number;
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
  size = HUD_SIZE,
  driver,
  headingDeg = 0,
  dest,
  showDest,
  departure = HUSKO_DEPARTURE_HUB,
  showDeparture = true,
  hudFooter = 'LONG BEACH · CADILLAC SUIVI',
}: Props) {
  // Force le fallback OSM pour éviter toute dépendance runtime aux clés/SDK Google.
  const useFallback = true;
  const footerTag = useFallback ? `${hudFooter} · OSM` : hudFooter;
  const useGoogleStyle = Platform.OS === 'android';

  const driverTrackKey = useMemo(
    () =>
      driver
        ? `${driver.latitude.toFixed(5)}_${driver.longitude.toFixed(5)}_${headingDeg.toFixed(0)}`
        : 'no-driver',
    [driver, headingDeg]
  );
  const tracksDepartureMarker = useTracksViewChangesForCustomMarker(
    showDeparture && departure ? `${departure.latitude}_${departure.longitude}` : 'no-dep'
  );
  const tracksDriverMarker = useTracksViewChangesForCustomMarker(driverTrackKey);

  const frameSize = { width: size, height: size } as const;

  if (useFallback) {
    return (
      <View style={[elevation.hero, frameSize]} collapsable={false}>
        <GTAHudFrame size={size} footerTag={footerTag}>
          <GTAMiniMapFallbackInterior
            region={region}
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
    <View style={[elevation.hero, frameSize]} collapsable={false}>
      <GTAHudFrame size={size} footerTag={footerTag}>
        <MapView
          style={styles.map}
          collapsable={false}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          region={region}
          rotateEnabled={false}
          pitchEnabled={false}
          scrollEnabled={false}
          zoomEnabled={false}
          loadingEnabled
          toolbarEnabled={false}
          customMapStyle={useGoogleStyle ? mapDarkStyle : undefined}
          mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        >
          {showDeparture && departure ? (
            <Marker
              coordinate={departure}
              anchor={{ x: 0.5, y: 1 }}
              zIndex={1}
              tracksViewChanges={tracksDepartureMarker}
              title="Husko · QG"
            >
              <HuskoDepartureBuilding size={48} />
            </Marker>
          ) : null}
          {showDest && dest ? (
            <Marker coordinate={dest} zIndex={2} pinColor={colors.accent} title="Livraison" />
          ) : null}
          {driver ? (
            <Marker
              coordinate={driver}
              anchor={{ x: 0.5, y: 0.5 }}
              zIndex={3}
              tracksViewChanges={tracksDriverMarker}
            >
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
