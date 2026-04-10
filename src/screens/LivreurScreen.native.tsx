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
import { GTAMiniMapFallbackInterior } from '@/components/GTAMiniMapFallbackInterior';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { LivreurAppGate } from '@/components/LivreurAppGate';
import { LivreurOrderPanel } from '@/components/LivreurOrderPanel';
import { FONT } from '@/constants/fonts';
import { mapDarkStyle } from '@/constants/mapDarkStyle';
import { colors, elevation, radius, spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';
import type { MapRegion } from '@/types/mapRegion';
import { HUSKO_DEPARTURE_HUB } from '@/constants/huskoDepartureHub';
import { livreurScreenVisual } from '@/constants/livreurScreenVisual';
import { useTracksViewChangesForCustomMarker } from '@/hooks/useTracksViewChangesForCustomMarker';
import { ANGERS_DEFAULT, useHuskoStore } from '@/stores/useHuskoStore';
import { postRuntimeDebugIngest } from '@/utils/debugIngestRuntime';
import { fitMapRegion } from '@/utils/fitMapRegion';
import { isMapsKeyConfiguredForPlatform } from '@/utils/mapsBuildInfo';

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
  const mapsConfigured = isMapsKeyConfiguredForPlatform();

  useEffect(() => {
    // #region agent log
    postRuntimeDebugIngest({
      runId: 'run5',
      hypothesisId: 'H12',
      location: 'LivreurScreen.native.tsx:mount',
      message: 'livreur map capability snapshot',
      data: { livreurOnline, mapsConfigured, hasDriver: driver != null },
    });
    // #endregion
  }, [livreurOnline, mapsConfigured, driver]);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      // #region agent log
      postRuntimeDebugIngest({
        runId: 'run1',
        hypothesisId: 'H3',
        location: 'LivreurScreen.native.tsx:start:permission',
        message: 'location permission status',
        data: { status, livreurOnline },
      });
      // #endregion
      if (status !== 'granted') {
        setSnack('Activez la localisation pour le suivi livreur.');
        return;
      }
      subRef.current?.remove();
      subRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 3,
          timeInterval: 1500,
        },
        (loc) => {
          if (cancelled) return;
          const lat = loc.coords.latitude;
          const lng = loc.coords.longitude;
          const raw = loc.coords.heading;
          const heading = typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
          // #region agent log
          postRuntimeDebugIngest({
            runId: 'run1',
            hypothesisId: 'H3',
            location: 'LivreurScreen.native.tsx:watchPosition',
            message: 'location update',
            data: {
              lat,
              lng,
              heading,
              accuracy: loc.coords.accuracy ?? null,
              speed: loc.coords.speed ?? null,
            },
          });
          // #endregion
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
      setDriver(null, 0);
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
              trackColor={{ false: colors.switchTrackOff, true: colors.accentDim }}
            />
          </View>

          <DeploymentHints mode="alerts" mapsRelevant />

          <View style={styles.mapContainer}>
            {!mapsConfigured ? (
              <View style={styles.mapFallback} pointerEvents="none">
                <GTAMiniMapFallbackInterior
                  region={region}
                  driver={driver}
                  headingDeg={driverHeading}
                  departure={HUSKO_DEPARTURE_HUB}
                  showDeparture
                  showDest={false}
                />
              </View>
            ) : null}
            {mapsConfigured ? (
              <MapView
                style={[styles.map, styles.mapBlend]}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                region={region}
                onRegionChangeComplete={setRegion}
                onMapReady={() => {
                  // #region agent log
                  postRuntimeDebugIngest({
                    runId: 'run6',
                    hypothesisId: 'H13',
                    location: 'LivreurScreen.native.tsx:map:onMapReady',
                    message: 'native map ready event',
                    data: { mapsConfigured },
                  });
                  // #endregion
                }}
                onMapLoaded={() => {
                  // #region agent log
                  postRuntimeDebugIngest({
                    runId: 'run6',
                    hypothesisId: 'H13',
                    location: 'LivreurScreen.native.tsx:map:onMapLoaded',
                    message: 'native map loaded event',
                    data: { mapsConfigured },
                  });
                  // #endregion
                }}
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
            ) : null}

            <View style={styles.miniWrap} pointerEvents="box-none">
              <GTAMiniMap
                size={192}
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
            <View style={styles.gtaFrameOverlay} pointerEvents="none">
              <View style={[styles.gtaCorner, styles.gtaCornerTL]} />
              <View style={[styles.gtaCorner, styles.gtaCornerTR]} />
              <View style={[styles.gtaCorner, styles.gtaCornerBL]} />
              <View style={[styles.gtaCorner, styles.gtaCornerBR]} />
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
    borderColor: livreurScreenVisual.nativeToolbarBorder,
    backgroundColor: livreurScreenVisual.nativeToolbarBg,
    ...elevation.card,
  },
  toolbarLabel: { fontFamily: FONT.bold, color: WC.neonCyan, fontSize: 13, letterSpacing: 1.2 },
  mapContainer: { flex: 1, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  mapBlend: { opacity: 0.8 },
  mapFallback: { ...StyleSheet.absoluteFillObject },
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
    backgroundColor: livreurScreenVisual.nativeHudBg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: livreurScreenVisual.nativeHudBorder,
    ...elevation.card,
  },
  hudPulse: { opacity: 0.95 },
  hudText: { fontFamily: FONT.bold, color: colors.gold, fontSize: 11, letterSpacing: 2.5 },
  gtaFrameOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: livreurScreenVisual.nativeHudBorder,
    zIndex: 3,
  },
  gtaCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: colors.gold,
    opacity: 0.95,
  },
  gtaCornerTL: {
    top: spacing.sm,
    left: spacing.sm,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  gtaCornerTR: {
    top: spacing.sm,
    right: spacing.sm,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  gtaCornerBL: {
    bottom: spacing.sm,
    left: spacing.sm,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  gtaCornerBR: {
    bottom: spacing.sm,
    right: spacing.sm,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
});
