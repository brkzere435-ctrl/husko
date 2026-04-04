import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Switch, View } from 'react-native';
import { Snackbar, Text } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CarMarkerIcon } from '@/components/CarMarkerIcon';
import { HuskoDepartureBuilding } from '@/components/HuskoDepartureBuilding';
import { DeploymentHints } from '@/components/DeploymentHints';
import { GTAMiniMap } from '@/components/GTAMiniMap';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { LivreurAppGate } from '@/components/LivreurAppGate';
import { LivreurOrderPanel } from '@/components/LivreurOrderPanel';
import { FONT } from '@/constants/fonts';
import { mapDarkStyle } from '@/constants/mapDarkStyle';
import { colors, elevation, radius, spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';
import type { MapRegion } from '@/types/mapRegion';
import { HUSKO_DEPARTURE_HUB } from '@/constants/huskoDepartureHub';
import { useTracksViewChangesForCustomMarker } from '@/hooks/useTracksViewChangesForCustomMarker';
import { ANGERS_DEFAULT, useHuskoStore } from '@/stores/useHuskoStore';
import { fitMapRegion } from '@/utils/fitMapRegion';

export default function LivreurScreenNative() {
  const setDriver = useHuskoStore((s) => s.setDriver);
  const livreurOnline = useHuskoStore((s) => s.livreurOnline);
  const setLivreurOnline = useHuskoStore((s) => s.setLivreurOnline);
  const driverHeading = useHuskoStore((s) => s.driverHeading);
  const driver = useHuskoStore((s) => s.driver);

  const [region, setRegion] = useState<MapRegion>({
    ...ANGERS_DEFAULT,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  });

  const subRef = useRef<Location.LocationSubscription | null>(null);
  const [snack, setSnack] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setSnack('Activez la localisation pour le suivi livreur.');
        return;
      }
      subRef.current?.remove();
      subRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 8,
          timeInterval: 4000,
        },
        (loc) => {
          if (cancelled) return;
          const lat = loc.coords.latitude;
          const lng = loc.coords.longitude;
          const raw = loc.coords.heading;
          const heading = typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
          setDriver({ latitude: lat, longitude: lng }, heading);
          setRegion((r) => ({
            ...r,
            latitude: lat,
            longitude: lng,
          }));
        }
      );
    }

    if (livreurOnline) start();
    else {
      subRef.current?.remove();
      subRef.current = null;
    }

    return () => {
      cancelled = true;
      subRef.current?.remove();
      subRef.current = null;
    };
  }, [livreurOnline, setDriver]);

  const miniRegion = useMemo<MapRegion>(() => {
    const pts = [HUSKO_DEPARTURE_HUB];
    if (driver) pts.push(driver);
    return fitMapRegion(pts, 1.95);
  }, [driver]);

  const driverMarkerKey = driver
    ? `${driver.latitude.toFixed(5)}_${driver.longitude.toFixed(5)}_${driverHeading.toFixed(0)}`
    : 'no-driver';
  const tracksHubMarker = useTracksViewChangesForCustomMarker('husko-hub');
  const tracksDriverMarker = useTracksViewChangesForCustomMarker(driverMarkerKey);

  const useGoogleStyle = Platform.OS === 'android';

  return (
    <LivreurAppGate>
      <WestCoastBackground>
        <SafeAreaView style={styles.root} edges={['bottom']}>
          <LivreurOrderPanel />
          <View style={styles.toolbar}>
            <Text style={styles.toolbarLabel}>En ligne</Text>
            <Switch
              value={livreurOnline}
              onValueChange={setLivreurOnline}
              trackColor={{ false: '#333', true: colors.accentDim }}
            />
          </View>

          <DeploymentHints mode="alerts" mapsRelevant />

          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              region={region}
              onRegionChangeComplete={setRegion}
              showsUserLocation={false}
              showsMyLocationButton={false}
              loadingEnabled
              toolbarEnabled={false}
              customMapStyle={useGoogleStyle ? mapDarkStyle : undefined}
              mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
            >
              <Marker
                coordinate={HUSKO_DEPARTURE_HUB}
                anchor={{ x: 0.5, y: 1 }}
                zIndex={1}
                tracksViewChanges={tracksHubMarker}
                title="Husko · QG"
              >
                <HuskoDepartureBuilding size={56} />
              </Marker>
              {driver ? (
                <Marker
                  coordinate={driver}
                  anchor={{ x: 0.5, y: 0.5 }}
                  zIndex={2}
                  tracksViewChanges={tracksDriverMarker}
                >
                  <CarMarkerIcon headingDeg={driverHeading} size={48} variant="lowrider" />
                </Marker>
              ) : null}
            </MapView>

            <View style={styles.miniWrap} pointerEvents="box-none">
              <GTAMiniMap
                region={miniRegion}
                driver={driver}
                headingDeg={driverHeading}
                showDest={false}
                hudFooter="213 · FLEET TRACKER"
              />
            </View>

            <View style={styles.hud} pointerEvents="none">
              <Ionicons name="radio-button-on" size={10} color={colors.gold} style={styles.hudPulse} />
              <Text style={styles.hudText}>HUSKO · MAP</Text>
            </View>
          </View>
          <Snackbar visible={snack.length > 0} onDismiss={() => setSnack('')} duration={4000}>
            {snack}
          </Snackbar>
        </SafeAreaView>
      </WestCoastBackground>
    </LivreurAppGate>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderColor: 'rgba(34, 211, 238, 0.35)',
    backgroundColor: 'rgba(8, 2, 4, 0.96)',
    ...elevation.card,
  },
  toolbarLabel: { fontFamily: FONT.bold, color: WC.neonCyan, fontSize: 13, letterSpacing: 1.2 },
  mapContainer: { flex: 1, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  miniWrap: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    zIndex: 4,
  },
  hud: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(34, 211, 238, 0.45)',
    ...elevation.card,
  },
  hudPulse: { opacity: 0.95 },
  hudText: { fontFamily: FONT.bold, color: colors.gold, fontSize: 11, letterSpacing: 2.5 },
});
