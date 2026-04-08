import React from 'react';
import { StyleSheet, View } from 'react-native';

import { GTAHudFrame } from '@/components/GTAHudFrame';
import { GTAMiniMapFallbackInterior } from '@/components/GTAMiniMapFallbackInterior';
import { HUSKO_DEPARTURE_HUB } from '@/constants/huskoDepartureHub';
import type { MapRegion } from '@/types/mapRegion';

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

/** Web : pas de Google Maps natif — même « radar » GTA que le fallback mobile. */
export function GTAMiniMap({
  region: _region,
  size = HUD_SIZE,
  driver,
  headingDeg = 0,
  dest,
  showDest,
  departure = HUSKO_DEPARTURE_HUB,
  showDeparture = true,
  hudFooter = 'LONG BEACH · CADILLAC SUIVI',
}: Props) {
  return (
    <GTAHudFrame size={size} footerTag={hudFooter}>
      <View style={styles.fill}>
        <GTAMiniMapFallbackInterior
          driver={driver}
          headingDeg={headingDeg}
          dest={dest}
          showDest={showDest}
          departure={departure}
          showDeparture={showDeparture}
        />
      </View>
    </GTAHudFrame>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
