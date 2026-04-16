import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Switch, View } from 'react-native';
import { Snackbar, Text } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeploymentHints } from '@/components/DeploymentHints';
import { GTAMiniMap } from '@/components/GTAMiniMap';
import { GTAMiniMapFallbackInterior } from '@/components/GTAMiniMapFallbackInterior';
import { LowriderHeroStrip } from '@/components/LowriderHeroStrip';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { LivreurAppGate } from '@/components/LivreurAppGate';
import { LivreurOrderPanel } from '@/components/LivreurOrderPanel';
import { FONT } from '@/constants/fonts';
import { colors, elevation, radius, spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';
import type { MapRegion } from '@/types/mapRegion';
import { HUSKO_DEPARTURE_HUB } from '@/constants/huskoDepartureHub';
import { livreurScreenVisual } from '@/constants/livreurScreenVisual';
import { ANGERS_DEFAULT, useHuskoStore } from '@/stores/useHuskoStore';
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
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastGpsProbeAtRef = useRef(0);
  const mainMapRef = useRef<MapView | null>(null);
  const lastMainMapCamAt = useRef(0);
  const [snack, setSnack] = useState('');
  const mapsConfigured = isMapsKeyConfiguredForPlatform();
  /** Mode pro: carte native dès que les clés Maps sont configurées, fallback seulement en secours. */
  const forceRadarFallback = !mapsConfigured;
  const [nativeMapFailed, setNativeMapFailed] = useState(false);
  const [nativeMapReady, setNativeMapReady] = useState(false);
  const [nativeMapLoaded, setNativeMapLoaded] = useState(false);
  const useRadarFallback = forceRadarFallback || nativeMapFailed;

  const LIVREUR_MAP_FAILSAFE_MS = 4_000;
  useEffect(() => {
    if (useRadarFallback) return;
    if (nativeMapReady) return;
    const timer = setTimeout(() => setNativeMapFailed(true), LIVREUR_MAP_FAILSAFE_MS);
    return () => clearTimeout(timer);
  }, [nativeMapReady, useRadarFallback]);

  const LIVREUR_MAP_LOADED_FAILSAFE_MS = 1500;
  useEffect(() => {
    if (useRadarFallback) return;
    if (!nativeMapReady || nativeMapLoaded) return;
    const timer = setTimeout(() => {
      setNativeMapFailed(true);
    }, LIVREUR_MAP_LOADED_FAILSAFE_MS);
    return () => clearTimeout(timer);
  }, [nativeMapLoaded, nativeMapReady, useRadarFallback]);

  /** Carte native : pas d’`animateToRegion` avant `onMapReady` (sinon GMS ignore / écran noir). */
  useEffect(() => {
    if (useRadarFallback || !nativeMapReady) return;
    const now = Date.now();
    if (lastMainMapCamAt.current > 0 && now - lastMainMapCamAt.current < 2000) return;
    lastMainMapCamAt.current = now;
    requestAnimationFrame(() => {
      mainMapRef.current?.animateToRegion(region, 420);
    });
  }, [region, useRadarFallback, nativeMapReady]);

  useEffect(() => {
    let cancelled = false;
    const applyLocation = (
      lat: number,
      lng: number,
      heading: number
    ) => {
      if (cancelled) return;
      const now = Date.now();
      if (now - lastGpsProbeAtRef.current > 3000) {
        lastGpsProbeAtRef.current = now;
        console.log(
          `[DBG21424c][H1] livreur GPS point accepted lat=${Math.round(lat * 1e5) / 1e5} lng=${Math.round(lng * 1e5) / 1e5} heading=${Math.round(heading)} online=${String(livreurOnline)}`
        );
        // #region agent log
        fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'21424c'},body:JSON.stringify({sessionId:'21424c',runId:'gps-live-chain',hypothesisId:'H1',location:'LivreurScreen.native.tsx:applyLocation',message:'livreur GPS point accepted',data:{livreurOnline,lat:Math.round(lat*1e5)/1e5,lng:Math.round(lng*1e5)/1e5,heading:Math.round(heading)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      }
      setDriver({ latitude: lat, longitude: lng }, heading);
      // Ne pas centrer strictement sur le livreur: garder une zone de contexte
      // (QG + position livreur) pour rendre le mouvement visible.
      setRegion(fitMapRegion([HUSKO_DEPARTURE_HUB, { latitude: lat, longitude: lng }], 1.95));
    };

    async function start() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setSnack('Activez la localisation pour le suivi livreur.');
          return;
        }
        const prime = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const lat0 = prime.coords.latitude;
        const lng0 = prime.coords.longitude;
        const raw0 = prime.coords.heading;
        const heading0 = typeof raw0 === 'number' && Number.isFinite(raw0) ? raw0 : 0;
        applyLocation(lat0, lng0, heading0);
        subRef.current?.remove();
        subRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            distanceInterval: 0,
            timeInterval: 1000,
          },
          (loc) => {
            if (cancelled) return;
            const lat = loc.coords.latitude;
            const lng = loc.coords.longitude;
            const raw = loc.coords.heading;
            const heading = typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
            applyLocation(lat, lng, heading);
          }
        );
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(() => {
          if (cancelled || !livreurOnline) return;
          void Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
            .then((loc) => {
              const lat = loc.coords.latitude;
              const lng = loc.coords.longitude;
              const raw = loc.coords.heading;
              const heading = typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
              applyLocation(lat, lng, heading);
            })
            .catch(() => {});
        }, 5000);
      } catch {
        setSnack('Impossible d’activer le GPS (services de localisation ?).');
      }
    }

    if (livreurOnline) start();
    else {
      subRef.current?.remove();
      subRef.current = null;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      setDriver(null, 0);
    }

    return () => {
      cancelled = true;
      subRef.current?.remove();
      subRef.current = null;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [livreurOnline, setDriver]);

  const miniRegion = useMemo<MapRegion>(() => {
    const pts = [HUSKO_DEPARTURE_HUB];
    if (driver) pts.push(driver);
    return fitMapRegion(pts, 1.95);
  }, [driver]);

  return (
    <LivreurAppGate>
      <WestCoastBackground>
        <SafeAreaView style={styles.root} edges={['bottom']}>
          <LivreurOrderPanel />
          <View style={styles.heroStripWrap}>
            <LowriderHeroStrip height={96} />
          </View>
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
            {useRadarFallback ? (
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
            {!useRadarFallback ? (
              <View style={styles.mapStack}>
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
                <MapView
                  ref={mainMapRef}
                  style={[styles.map, styles.mapBlend, !nativeMapLoaded && styles.mapHidden]}
                  provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                  onError={() => setNativeMapFailed(true)}
                  onMapReady={() => setNativeMapReady(true)}
                  onMapLoaded={() => setNativeMapLoaded(true)}
                  initialRegion={{
                    ...ANGERS_DEFAULT,
                    latitudeDelta: 0.012,
                    longitudeDelta: 0.012,
                  }}
                  rotateEnabled={false}
                  pitchEnabled={false}
                  showsUserLocation={false}
                  showsMyLocationButton={false}
                  loadingEnabled
                  toolbarEnabled={false}
                  mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
                >
                  <Marker
                    coordinate={HUSKO_DEPARTURE_HUB}
                    zIndex={1}
                    title="Husko · QG"
                    pinColor={colors.accent}
                  />
                  {driver ? (
                    <Marker
                      coordinate={driver}
                      zIndex={2}
                      title={`Livreur · cap ${Math.round(driverHeading)}°`}
                      pinColor={colors.posterRed}
                    />
                  ) : null}
                </MapView>
              </View>
            ) : null}

            <View style={styles.miniWrap} pointerEvents="box-none">
              <GTAMiniMap
                size={192}
                region={miniRegion}
                forceFallback={!mapsConfigured}
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
  heroStripWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
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
  mapStack: { ...StyleSheet.absoluteFillObject },
  map: { ...StyleSheet.absoluteFillObject },
  mapBlend: { opacity: 0.8 },
  mapHidden: { opacity: 0.01 },
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
