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

export function GTAMiniMapFallbackInterior({
  region,
  driver,
  headingDeg = 0,
  dest,
  showDest,
  departure = HUSKO_DEPARTURE_HUB,
  showDeparture = true,
}: Props) {
  const [tileError, setTileError] = useState(false);

  const mapUri = useMemo(() => {
    const points: { latitude: number; longitude: number }[] = [];
    if (showDeparture && departure) points.push(departure);
    if (showDest && dest) points.push(dest);
    if (driver) points.push(driver);

    const centerLat =
      points.length > 0
        ? points.reduce((sum, p) => sum + p.latitude, 0) / points.length
        : (region?.latitude ?? HUSKO_DEPARTURE_HUB.latitude);
    const centerLng =
      points.length > 0
        ? points.reduce((sum, p) => sum + p.longitude, 0) / points.length
        : (region?.longitude ?? HUSKO_DEPARTURE_HUB.longitude);

    const latitudeDelta = region?.latitudeDelta ?? 0.02;
    const zoom = Math.max(11, Math.min(18, Math.round(Math.log2(360 / Math.max(latitudeDelta, 0.0001)))));

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
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${centerLat},${centerLng}&zoom=${zoom}&size=640x640&maptype=mapnik${markerQuery}`;
  }, [departure, dest, driver, region, showDeparture, showDest]);

  return (
    <View style={styles.fakeMap} collapsable={false}>
      {!tileError ? (
        <Image
          source={{ uri: mapUri }}
          style={styles.mapImage}
          resizeMode="cover"
          onError={() => setTileError(true)}
          accessibilityLabel="Carte OpenStreetMap"
        />
      ) : (
        <View style={styles.tileErrorWrap}>
          <Text style={styles.tileErrorTitle}>Carte temporairement indisponible</Text>
          <Text style={styles.tileErrorText}>Vérifiez la connexion réseau puis réessayez.</Text>
        </View>
      )}
      <View style={styles.overlayDim} pointerEvents="none" />
      <View style={styles.zoneRing} pointerEvents="none" />
      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerTR]} />
      <View style={[styles.corner, styles.cornerBL]} />
      <View style={[styles.corner, styles.cornerBR]} />
      <View style={styles.gridLine} />
      <View style={[styles.gridLine, styles.gridV]} />
      <View style={styles.palmSilhouette} />
      {showDeparture && departure ? (
        <View style={styles.hubWrap} accessibilityLabel="QG Husko">
          <HuskoDepartureBuilding size={44} />
          <Text style={styles.hubTag}>HQ · H</Text>
        </View>
      ) : null}
      {driver ? (
        <View style={styles.markerWrap} pointerEvents="none">
          <CarMarkerIcon headingDeg={headingDeg} size={38} variant="lowrider" />
        </View>
      ) : null}
      {showDest && dest ? (
        <View style={styles.destDot}>
          <Text style={styles.destX}>×</Text>
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
  },
  overlayDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 3, 8, 0.28)',
  },
  tileErrorWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    backgroundColor: 'rgba(10, 4, 8, 0.9)',
  },
  tileErrorTitle: {
    fontFamily: FONT.bold,
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  tileErrorText: {
    marginTop: 8,
    fontFamily: FONT.medium,
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
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
    top: '14%',
    left: '10%',
    zIndex: 2,
    alignItems: 'center',
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
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  destX: { fontFamily: FONT.bold, color: colors.text, fontSize: 14 },
});
