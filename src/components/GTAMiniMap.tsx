import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { GTAHudFrame } from '@/components/GTAHudFrame';
import { GTAMiniMapFallbackInterior } from '@/components/GTAMiniMapFallbackInterior';
import { HUSKO_DEPARTURE_HUB } from '@/constants/huskoDepartureHub';
import { colors, elevation } from '@/constants/theme';
import type { MapRegion } from '@/types/mapRegion';
import { isMapsKeyConfiguredForPlatform } from '@/utils/mapsBuildInfo';

type Props = {
  region: MapRegion;
  size?: number;
  forceFallback?: boolean;
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
  forceFallback = false,
  driver,
  headingDeg = 0,
  dest,
  showDest,
  departure = HUSKO_DEPARTURE_HUB,
  showDeparture = true,
  hudFooter = 'LONG BEACH · CADILLAC SUIVI',
}: Props) {
  const mapsConfigured = isMapsKeyConfiguredForPlatform();
  const [nativeMapFailed, setNativeMapFailed] = useState(false);
  // Utilise la carte native dès que la clé est dispo. Repli HUD uniquement si clé absente
  // ou si MapView remonte une erreur runtime (permissions Google Maps / auth / renderer).
  const useFallback = forceFallback || !mapsConfigured || nativeMapFailed;
  const footerTag = useFallback ? `${hudFooter} · OSM` : hudFooter;

  const driverTitle = useMemo(
    () => (driver ? `Livreur · cap ${Math.round(headingDeg)}°` : 'Livreur'),
    [driver, headingDeg]
  );

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
          onError={() => setNativeMapFailed(true)}
          region={region}
          rotateEnabled={false}
          pitchEnabled={false}
          scrollEnabled={false}
          zoomEnabled={false}
          loadingEnabled
          toolbarEnabled={false}
          mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        >
          {showDeparture && departure ? (
            <Marker
              coordinate={departure}
              zIndex={1}
              title="Husko · QG"
              pinColor={colors.accent}
            />
          ) : null}
          {showDest && dest ? (
            <Marker coordinate={dest} zIndex={2} pinColor={colors.accent} title="Livraison" />
          ) : null}
          {driver ? (
            <Marker
              coordinate={driver}
              zIndex={3}
              title={driverTitle}
              pinColor={colors.posterRed}
              rotation={headingDeg}
              flat
            />
          ) : null}
        </MapView>
      </GTAHudFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { ...StyleSheet.absoluteFillObject },
});
