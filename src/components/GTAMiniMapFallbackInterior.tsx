import { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { HuskoDepartureBuilding } from '@/components/HuskoDepartureBuilding';
import { FONT } from '@/constants/fonts';
import { HUSKO_DEPARTURE_HUB } from '@/constants/huskoDepartureHub';
import { gtaMapFallbackVisual } from '@/constants/hudVisual';
import { colors } from '@/constants/theme';
import type { MapRegion } from '@/types/mapRegion';

import { CarMarkerIcon } from './CarMarkerIcon';

type Props = {
  region?: MapRegion;
  driver?: { latitude: number; longitude: number } | null;
  headingDeg?: number;
  dest?: { latitude: number; longitude: number } | null;
  showDest?: boolean;
  departure?: { latitude: number; longitude: number } | null;
  showDeparture?: boolean;
};

type RadarPoint = { x: number; y: number };

function clamp01(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

function projectToRadar(point: { latitude: number; longitude: number }, region?: MapRegion): RadarPoint {
  if (!region) return { x: 50, y: 50 };
  const minLat = region.latitude - region.latitudeDelta / 2;
  const maxLat = region.latitude + region.latitudeDelta / 2;
  const minLng = region.longitude - region.longitudeDelta / 2;
  const maxLng = region.longitude + region.longitudeDelta / 2;
  const x = clamp01((point.longitude - minLng) / Math.max(maxLng - minLng, 1e-8));
  const y = 1 - clamp01((point.latitude - minLat) / Math.max(maxLat - minLat, 1e-8));
  return { x: x * 100, y: y * 100 };
}

export function GTAMiniMapFallbackInterior({
  region,
  driver,
  headingDeg = 0,
  dest,
  showDest,
  departure = HUSKO_DEPARTURE_HUB,
  showDeparture = true,
}: Props) {
  /** 0 = tuile avec marqueurs ; 1 = tuile centre seul (certains proxies bloquent le format markers=). */
  const [staticMapAttempt, setStaticMapAttempt] = useState(0);
  const [tileError, setTileError] = useState(false);
  const depPlot = useMemo(
    () => (showDeparture && departure ? projectToRadar(departure, region) : null),
    [showDeparture, departure, region]
  );
  const destPlot = useMemo(
    () => (showDest && dest ? projectToRadar(dest, region) : null),
    [showDest, dest, region]
  );
  const driverPlot = useMemo(() => (driver ? projectToRadar(driver, region) : null), [driver, region]);

  const { mapUriWithMarkers, mapUriPlain } = useMemo(() => {
    const points: { latitude: number; longitude: number }[] = [];
    if (showDeparture && departure) points.push(departure);
    if (showDest && dest) points.push(dest);
    if (driver) points.push(driver);

    const cLat =
      points.length > 0
        ? points.reduce((sum, p) => sum + p.latitude, 0) / points.length
        : (region?.latitude ?? HUSKO_DEPARTURE_HUB.latitude);
    const cLng =
      points.length > 0
        ? points.reduce((sum, p) => sum + p.longitude, 0) / points.length
        : (region?.longitude ?? HUSKO_DEPARTURE_HUB.longitude);

    const latitudeDelta = region?.latitudeDelta ?? 0.02;
    const z = Math.max(11, Math.min(18, Math.round(Math.log2(360 / Math.max(latitudeDelta, 0.0001)))));

    const markerParts: string[] = [];
    if (showDeparture && departure) {
      markerParts.push(`${departure.latitude},${departure.longitude},lightblue1`);
    }
    if (showDest && dest) {
      markerParts.push(`${dest.latitude},${dest.longitude},lightgreen1`);
    }
    if (driver) {
      markerParts.push(`${driver.latitude},${driver.longitude},red`);
    }
    const markerQuery = markerParts.length > 0 ? `&markers=${encodeURIComponent(markerParts.join('|'))}` : '';
    const base = `https://staticmap.openstreetmap.de/staticmap.php?center=${cLat},${cLng}&zoom=${z}&size=640x640&maptype=mapnik`;
    return {
      mapUriWithMarkers: `${base}${markerQuery}`,
      mapUriPlain: base,
    };
  }, [departure, dest, driver, region, showDeparture, showDest]);

  const mapUri = staticMapAttempt === 0 ? mapUriWithMarkers : mapUriPlain;

  return (
    <View style={styles.fakeMap} collapsable={false}>
      {!tileError ? (
        <Image
          key={mapUri}
          source={{ uri: mapUri }}
          style={styles.mapImage}
          resizeMode="cover"
          onError={() => {
            if (staticMapAttempt === 0) setStaticMapAttempt(1);
            else setTileError(true);
          }}
          accessibilityLabel="Carte OpenStreetMap"
        />
      ) : null}
      <View style={styles.overlayDim} pointerEvents="none" />
      <View style={styles.radarBackdrop} pointerEvents="none" />
      <View style={styles.zoneRing} pointerEvents="none" />
      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerTR]} />
      <View style={[styles.corner, styles.cornerBL]} />
      <View style={[styles.corner, styles.cornerBR]} />
      <View style={styles.gridLine} />
      <View style={[styles.gridLine, styles.gridV]} />
      <View style={styles.palmSilhouette} />
      {depPlot ? (
        <View
          style={[styles.hubWrap, { left: `${depPlot.x}%`, top: `${depPlot.y}%` }]}
          accessibilityLabel="QG Husko"
        >
          <HuskoDepartureBuilding size={44} />
          <Text style={styles.hubTag}>HQ · H</Text>
        </View>
      ) : null}
      {driverPlot ? (
        <View style={[styles.markerWrap, { left: `${driverPlot.x}%`, top: `${driverPlot.y}%` }]} pointerEvents="none">
          <CarMarkerIcon headingDeg={headingDeg} size={38} variant="lowrider" />
        </View>
      ) : null}
      {destPlot ? (
        <View style={[styles.destDot, { left: `${destPlot.x}%`, top: `${destPlot.y}%` }]}>
          <Text style={styles.destX}>×</Text>
        </View>
      ) : null}
      <View style={styles.legend} pointerEvents="none">
        <Text style={styles.legendText}>RADAR LOCAL</Text>
      </View>
      {tileError ? (
        <View style={styles.offlineBadge} pointerEvents="none">
          <Text style={styles.offlineBadgeText}>OSM OFFLINE · RADAR ACTIF</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fakeMap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.mapRadarBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: gtaMapFallbackVisual.zoneBorderDim,
  },
  mapImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  overlayDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 3, 8, 0.16)',
  },
  radarBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 12, 22, 0.32)',
  },
  offlineBadge: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.45)',
    backgroundColor: 'rgba(12, 4, 6, 0.74)',
  },
  offlineBadgeText: {
    fontFamily: FONT.bold,
    color: colors.gold,
    fontSize: 9,
    letterSpacing: 0.7,
  },
  zoneRing: {
    position: 'absolute',
    top: '7%',
    left: '7%',
    right: '7%',
    bottom: '14%',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: gtaMapFallbackVisual.zoneBorder,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: gtaMapFallbackVisual.cornerBracket,
  },
  cornerTL: {
    top: '5%',
    left: '5%',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 2,
  },
  cornerTR: {
    top: '5%',
    right: '5%',
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 2,
  },
  cornerBL: {
    bottom: '12%',
    left: '5%',
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 2,
  },
  cornerBR: {
    bottom: '12%',
    right: '5%',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 2,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: gtaMapFallbackVisual.gridLine,
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
    backgroundColor: gtaMapFallbackVisual.palmSilhouette,
    opacity: 0.5,
  },
  hubWrap: {
    position: 'absolute',
    zIndex: 2,
    alignItems: 'center',
    transform: [{ translateX: -22 }, { translateY: -22 }],
  },
  hubTag: {
    fontFamily: FONT.bold,
    marginTop: 2,
    fontSize: 7,
    letterSpacing: 1,
    color: colors.gold,
    opacity: 0.95,
  },
  markerWrap: {
    position: 'absolute',
    zIndex: 4,
    transform: [{ translateX: -19 }, { translateY: -30 }],
  },
  destDot: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    transform: [{ translateX: -11 }, { translateY: -11 }],
  },
  destX: { fontFamily: FONT.bold, color: colors.text, fontSize: 14 },
  legend: {
    position: 'absolute',
    right: 8,
    bottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.6)',
    backgroundColor: 'rgba(2, 10, 16, 0.75)',
    zIndex: 6,
  },
  legendText: {
    fontFamily: FONT.bold,
    color: '#22d3ee',
    fontSize: 8,
    letterSpacing: 0.8,
  },
});
