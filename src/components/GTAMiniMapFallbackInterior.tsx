import { StyleSheet, Text, View } from 'react-native';

import { HuskoDepartureBuilding } from '@/components/HuskoDepartureBuilding';
import { FONT } from '@/constants/fonts';
import { HUSKO_DEPARTURE_HUB } from '@/constants/huskoDepartureHub';
import { gtaMapFallbackVisual } from '@/constants/hudVisual';
import { colors } from '@/constants/theme';

import { CarMarkerIcon } from './CarMarkerIcon';

type Props = {
  driver?: { latitude: number; longitude: number } | null;
  headingDeg?: number;
  dest?: { latitude: number; longitude: number } | null;
  showDest?: boolean;
  departure?: { latitude: number; longitude: number } | null;
  showDeparture?: boolean;
};

/**
 * Carte « radar » dessinée (sans Google Maps) — même look que le build web.
 * Utilisé sur Android/iOS si la clé Maps n’est pas dans le build ou en secours erreur tuiles.
 */
export function GTAMiniMapFallbackInterior({
  driver,
  headingDeg = 0,
  dest,
  showDest,
  departure = HUSKO_DEPARTURE_HUB,
  showDeparture = true,
}: Props) {
  return (
    <View style={styles.fakeMap}>
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
