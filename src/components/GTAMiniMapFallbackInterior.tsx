import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, StyleSheet, Text, View } from 'react-native';

import { HuskoDepartureBuilding } from '@/components/HuskoDepartureBuilding';
import { FONT } from '@/constants/fonts';
import { HUSKO_DEPARTURE_HUB } from '@/constants/huskoDepartureHub';
import { gtaMapFallbackVisual } from '@/constants/hudVisual';
import { colors } from '@/constants/theme';
import type { MapRegion } from '@/types/mapRegion';

import { CarMarkerIcon } from './CarMarkerIcon';
const RADAR_TEXTURE = require('../../assets/textures/carbon-mesh.png');

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
  /** Évite l’impression « carré noir » pendant le chargement réseau de la tuile OSM. */
  const [tileLoaded, setTileLoaded] = useState(false);
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

  useEffect(() => {
    setTileLoaded(false);
  }, [mapUri]);

  const showTileSpinner = !tileError && !tileLoaded;

  return (
    <View style={styles.fakeMap} collapsable={false}>
      <ImageBackground source={RADAR_TEXTURE} style={styles.frameBackground} imageStyle={styles.frameBackgroundImage}>
        <View style={styles.mapViewport} pointerEvents="none">
          {!tileError ? (
            <Image
              key={mapUri}
              source={{ uri: mapUri }}
              style={styles.mapImage}
              resizeMode="cover"
              onLoad={() => setTileLoaded(true)}
              onError={() => {
                setTileLoaded(false);
                if (staticMapAttempt === 0) setStaticMapAttempt(1);
                else setTileError(true);
              }}
              accessibilityLabel="Carte OpenStreetMap"
            />
          ) : null}
          {showTileSpinner ? (
            <View style={styles.tileLoadingWrap} pointerEvents="none">
              <ActivityIndicator size="small" color="rgba(34, 211, 238, 0.9)" />
            </View>
          ) : null}
          <View style={styles.overlayDim} pointerEvents="none" />
          <View style={styles.radarBackdrop} pointerEvents="none" />
          <View style={styles.roadLayer} pointerEvents="none">
            <View style={[styles.roadH, styles.roadH1]} />
            <View style={[styles.roadH, styles.roadH2]} />
            <View style={[styles.roadH, styles.roadH3]} />
            <View style={[styles.roadV, styles.roadV1]} />
            <View style={[styles.roadV, styles.roadV2]} />
            <View style={[styles.roadV, styles.roadV3]} />
            <View style={[styles.roadDiag, styles.roadDiag1]} />
            <View style={[styles.roadDiag, styles.roadDiag2]} />
            <View style={[styles.roadDiag, styles.roadDiag3]} />
            <View style={styles.roadRingOuter} />
            <View style={styles.roadRingInner} />
          </View>
          <View style={styles.zoneRing} pointerEvents="none" />
          <View style={styles.gridLine} />
          <View style={[styles.gridLine, styles.gridV]} />
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
            <View
              style={[styles.markerWrap, { left: `${driverPlot.x}%`, top: `${driverPlot.y}%` }]}
              pointerEvents="none"
            >
              <CarMarkerIcon headingDeg={headingDeg} size={42} variant="lowrider" />
            </View>
          ) : null}
          {destPlot ? (
            <View style={[styles.destDot, { left: `${destPlot.x}%`, top: `${destPlot.y}%` }]}>
              <Text style={styles.destX}>★</Text>
            </View>
          ) : null}
          {tileError ? (
            <View style={styles.offlineBadge} pointerEvents="none">
              <Text style={styles.offlineBadgeText}>OSM OFFLINE · RADAR ACTIF</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.miniRadar} pointerEvents="none">
          <View style={styles.miniRadarDisk}>
            <View style={styles.miniRadarArrow} />
          </View>
        </View>
        <View style={styles.legend} pointerEvents="none">
          <Text style={styles.legendText}>RADAR LOCAL</Text>
        </View>
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />
        <View style={styles.mapStatusPill}>
          <Text style={styles.mapStatusPillText}>{driver ? 'GPS LIVE' : 'GPS EN ATTENTE'}</Text>
        </View>
      </ImageBackground>
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
  frameBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    overflow: 'hidden',
    /** Si la texture carbone ou la tuile OSM tarde : pas de rectangle noir pur. */
    backgroundColor: colors.mapRadarBg,
  },
  frameBackgroundImage: {
    opacity: 0.42,
  },
  mapViewport: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '8%',
    bottom: '18%',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(14, 14, 16, 0.95)',
    /** Base volontairement claire pour bannir l’effet "écran noir" même sans tuile OSM. */
    backgroundColor: '#60748b',
  },
  mapImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.82,
  },
  tileLoadingWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  overlayDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 8, 10, 0.12)',
  },
  radarBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 10, 16, 0.16)',
  },
  roadLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.88,
  },
  roadH: {
    position: 'absolute',
    left: '-6%',
    right: '-6%',
    height: 4,
    borderRadius: 3,
    backgroundColor: 'rgba(207, 212, 220, 0.45)',
  },
  roadH1: { top: '24%', transform: [{ rotate: '-7deg' }] },
  roadH2: { top: '52%', transform: [{ rotate: '4deg' }] },
  roadH3: { top: '74%', transform: [{ rotate: '-3deg' }] },
  roadV: {
    position: 'absolute',
    top: '-8%',
    bottom: '-8%',
    width: 4,
    borderRadius: 3,
    backgroundColor: 'rgba(195, 203, 214, 0.42)',
  },
  roadV1: { left: '28%', transform: [{ rotate: '5deg' }] },
  roadV2: { left: '54%', transform: [{ rotate: '-4deg' }] },
  roadV3: { left: '73%', transform: [{ rotate: '8deg' }] },
  roadDiag: {
    position: 'absolute',
    width: '150%',
    height: 4,
    borderRadius: 3,
    left: '-24%',
    top: '45%',
    backgroundColor: 'rgba(220, 225, 232, 0.38)',
  },
  roadDiag1: { transform: [{ rotate: '28deg' }] },
  roadDiag2: { transform: [{ rotate: '-24deg' }] },
  roadDiag3: { transform: [{ rotate: '14deg' }] },
  roadRingOuter: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    top: '18%',
    bottom: '18%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(198, 204, 213, 0.34)',
  },
  roadRingInner: {
    position: 'absolute',
    left: '30%',
    right: '30%',
    top: '30%',
    bottom: '30%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(182, 191, 202, 0.3)',
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
    top: '9%',
    left: '9%',
    right: '9%',
    bottom: '9%',
    borderRadius: 999,
    borderWidth: 1.2,
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
    top: '4%',
    left: '4%',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 2,
  },
  cornerTR: {
    top: '4%',
    right: '4%',
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 2,
  },
  cornerBL: {
    bottom: '4%',
    left: '4%',
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 2,
  },
  cornerBR: {
    bottom: '4%',
    right: '4%',
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
    transform: [{ translateX: -21 }, { translateY: -33 }],
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
  miniRadar: {
    position: 'absolute',
    left: 10,
    bottom: 8,
    zIndex: 6,
  },
  miniRadarDisk: {
    width: 58,
    height: 58,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.8)',
    backgroundColor: 'rgba(14, 16, 20, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniRadarArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#f8fafc',
  },
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
  mapStatusPill: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.5)',
    backgroundColor: 'rgba(20, 7, 10, 0.82)',
    zIndex: 7,
  },
  mapStatusPillText: {
    fontFamily: FONT.bold,
    color: colors.gold,
    fontSize: 9,
    letterSpacing: 0.9,
  },
});
