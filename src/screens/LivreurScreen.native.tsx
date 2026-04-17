import { Ionicons } from '@expo/vector-icons';
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
import {
  clearLivreurWatch,
  debugAgentPost,
  dumpAgentDebugTailToConsole,
  ensureLivreurLocationPermission,
  geoThrownCode,
  getInitialLivreurPosition,
  livreurGeoErrorUserHint,
  startLivreurWatch,
} from '@/services/livreurGeolocation';

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

  const watchIdRef = useRef<number | null>(null);
  /** Évite un spam Snackbar si le watch renvoie des erreurs en boucle (Play Services / GPS). */
  const watchGpsErrShownRef = useRef(false);
  const mainMapRef = useRef<MapView | null>(null);
  const lastMainMapCamAt = useRef(0);
  const [snack, setSnack] = useState('');
  const mapsConfigured = isMapsKeyConfiguredForPlatform();
  /**
   * Google Maps Android API fails with INVALID_ARGUMENT on target devices.
   * Keep Android on radar fallback to avoid repeated black-map attempts.
   */
  const forceRadarFallback = Platform.OS === 'android' || !mapsConfigured;
  const [nativeMapFailed, setNativeMapFailed] = useState(false);
  const [nativeMapReady, setNativeMapReady] = useState(false);
  const [nativeMapLoaded, setNativeMapLoaded] = useState(false);
  const useRadarFallback = forceRadarFallback || nativeMapFailed;

  // #region agent log
  useEffect(() => {
    debugAgentPost(
      'LivreurScreen.native.tsx:mount',
      'LivreurScreen natif monté (vérif bundle + logcat)',
      'H0',
      { platform: Platform.OS }
    );
  }, []);

  useEffect(() => {
    const t = setTimeout(() => dumpAgentDebugTailToConsole(), 3000);
    return () => clearTimeout(t);
  }, []);
  // #endregion

  const LIVREUR_MAP_FAILSAFE_MS = 1_200;
  useEffect(() => {
    if (useRadarFallback) return;
    if (nativeMapReady) return;
    const timer = setTimeout(() => {
      setNativeMapFailed(true);
    }, LIVREUR_MAP_FAILSAFE_MS);
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
    console.log('[HuskoGeo] useEffect GPS livreur — entrée', { livreurOnline });
    let cancelled = false;
    const applyLocation = (
      lat: number,
      lng: number,
      heading: number
    ) => {
      if (cancelled) return;
      watchGpsErrShownRef.current = false;
      setDriver({ latitude: lat, longitude: lng }, heading);
      // Ne pas centrer strictement sur le livreur: garder une zone de contexte
      // (QG + position livreur) pour rendre le mouvement visible.
      setRegion(fitMapRegion([HUSKO_DEPARTURE_HUB, { latitude: lat, longitude: lng }], 1.95));
    };

    async function start() {
      try {
        const ok = await ensureLivreurLocationPermission();
        if (!ok) {
          setSnack('Activez la localisation pour le suivi livreur.');
          return;
        }
        const prime = await getInitialLivreurPosition();
        applyLocation(prime.lat, prime.lng, prime.headingDeg);
        if (watchIdRef.current != null) {
          clearLivreurWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        watchIdRef.current = startLivreurWatch(
          (lat, lng, heading) => {
            if (cancelled) return;
            applyLocation(lat, lng, heading);
          },
          (code, message) => {
            if (watchGpsErrShownRef.current) return;
            watchGpsErrShownRef.current = true;
            setSnack(livreurGeoErrorUserHint(code));
            // #region agent log
            debugAgentPost(
              'LivreurScreen.native.tsx:onWatchError',
              'watch error surfaced to UI',
              'H2',
              { code, message }
            );
            // #endregion
          }
        );
      } catch (e) {
        const thrownCode = geoThrownCode(e);
        // #region agent log
        debugAgentPost(
          'LivreurScreen.native.tsx:start',
          'start() catch',
          'H3',
          { err: String(e), thrownCode }
        );
        // #endregion
        setSnack(
          thrownCode != null
            ? livreurGeoErrorUserHint(thrownCode)
            : 'Impossible d’activer le GPS (services de localisation ?).'
        );
      }
    }

    if (livreurOnline) void start();
    else {
      watchGpsErrShownRef.current = false;
      if (watchIdRef.current != null) {
        clearLivreurWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setDriver(null, 0);
    }

    return () => {
      cancelled = true;
      if (watchIdRef.current != null) {
        clearLivreurWatch(watchIdRef.current);
        watchIdRef.current = null;
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
          {__DEV__ ? (
            <Text style={styles.geoDevHint} accessibilityLabel="Avertissement développement GPS">
              Développement : le simulateur / émulateur donne souvent un GPS faux ou absent — valider sur
              téléphone réel. Clé Maps : {mapsConfigured ? 'présente' : 'manquante (carte radar)'}.
            </Text>
          ) : null}

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
  geoDevHint: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
  },
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
