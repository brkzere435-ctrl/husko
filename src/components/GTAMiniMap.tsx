import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { GTAHudFrame } from '@/components/GTAHudFrame';
import { GTAMiniMapFallbackInterior } from '@/components/GTAMiniMapFallbackInterior';
import { HuskoDepartureBuilding } from '@/components/HuskoDepartureBuilding';
import { HUSKO_DEPARTURE_HUB } from '@/constants/huskoDepartureHub';
import { colors, elevation } from '@/constants/theme';
import type { MapRegion } from '@/types/mapRegion';
import { debugIngest9bf99d } from '@/utils/debugIngest9bf99d';
import { shouldPreferMiniMapFallback } from '@/utils/androidMapWorkaround';
import { sanitizeMapRegion } from '@/utils/fitMapRegion';
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

function logMapDebug(
  runId: string,
  hypothesisId: 'H1' | 'H2' | 'H3' | 'H4',
  location: string,
  message: string,
  data: Record<string, unknown>
) {
  debugIngest9bf99d({ runId, hypothesisId, location, message, data });
}

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
  const debugRunId = useMemo(() => `map-${Date.now().toString(36)}`, []);
  const mapsConfigured = isMapsKeyConfiguredForPlatform();
  const preferDeviceFallback = useMemo(() => shouldPreferMiniMapFallback(), []);
  const safeRegion = useMemo(() => sanitizeMapRegion(region), [region]);
  const [nativeMapFailed, setNativeMapFailed] = useState(false);
  const [nativeMapReady, setNativeMapReady] = useState(false);
  const [nativeMapLoaded, setNativeMapLoaded] = useState(false);
  /** Clé absente, échec runtime, ou appareil connu pour MapView noir (ex. Huawei) → radar GTA. */
  const useFallback =
    forceFallback || nativeMapFailed || !mapsConfigured || preferDeviceFallback;
  const footerTag = useFallback ? `${hudFooter} · OSM` : hudFooter;

  useEffect(() => {
    logMapDebug(
      debugRunId,
      'H1',
      'GTAMiniMap.tsx:decision',
      'map render decision updated',
      {
        platform: Platform.OS,
        mapsConfigured,
        preferDeviceFallback,
        forceFallback,
        nativeMapReady,
        nativeMapLoaded,
        nativeMapFailed,
        useFallback,
        hasDriver: !!driver,
        hasDest: !!dest,
        size,
      }
    );
  }, [
    debugRunId,
    mapsConfigured,
    preferDeviceFallback,
    forceFallback,
    nativeMapReady,
    nativeMapLoaded,
    nativeMapFailed,
    useFallback,
    driver,
    dest,
    size,
  ]);

  /** Ne pas couper MapView avant chargement GMS : 3,5 s démontait la carte sur téléphones réels. */
  const NATIVE_MAP_FAILSAFE_MS = 22_000;
  useEffect(() => {
    if (useFallback) return;
    if (nativeMapReady) return;
    logMapDebug(debugRunId, 'H2', 'GTAMiniMap.tsx:fallback-timeout:start', 'fallback failsafe armed', {
      nativeMapReady,
      nativeMapFailed,
      useFallback,
      failsafeMs: NATIVE_MAP_FAILSAFE_MS,
    });
    const timer = setTimeout(() => {
      logMapDebug(debugRunId, 'H2', 'GTAMiniMap.tsx:fallback-timeout:fire', 'fallback failsafe fired', {
        nativeMapReady,
        nativeMapFailed,
      });
      setNativeMapFailed(true);
    }, NATIVE_MAP_FAILSAFE_MS);
    return () => clearTimeout(timer);
  }, [debugRunId, nativeMapReady, nativeMapFailed, useFallback]);

  /**
   * Cas réel observé en prod: GMS répond "API token INVALID_ARGUMENT", MapView peut être "ready"
   * mais rester visuellement noir. Si la carte n'est jamais "loaded", bascule proprement en radar.
   */
  const NATIVE_MAP_LOADED_FAILSAFE_MS = 6500;
  useEffect(() => {
    if (useFallback) return;
    if (!nativeMapReady || nativeMapLoaded) return;
    const timer = setTimeout(() => {
      logMapDebug(
        debugRunId,
        'H3',
        'GTAMiniMap.tsx:map-loaded-timeout',
        'map ready but not loaded in time; fallback to radar',
        { nativeMapReady, nativeMapLoaded, timeoutMs: NATIVE_MAP_LOADED_FAILSAFE_MS }
      );
      setNativeMapFailed(true);
    }, NATIVE_MAP_LOADED_FAILSAFE_MS);
    return () => clearTimeout(timer);
  }, [debugRunId, nativeMapLoaded, nativeMapReady, useFallback]);

  /** Ne pas piloter `region` en prop : sur Android GMS se réinitialise / noircit si la région change à chaque render. */
  const mapRef = useRef<MapView | null>(null);
  const lastRegionSig = useRef<string>('');
  useEffect(() => {
    if (useFallback || !nativeMapReady) return;
    const sig = [
      safeRegion.latitude.toFixed(5),
      safeRegion.longitude.toFixed(5),
      safeRegion.latitudeDelta.toFixed(5),
      safeRegion.longitudeDelta.toFixed(5),
    ].join('|');
    if (sig === lastRegionSig.current) return;
    lastRegionSig.current = sig;
    const id = requestAnimationFrame(() => {
      mapRef.current?.animateToRegion(safeRegion, 380);
    });
    return () => cancelAnimationFrame(id);
  }, [safeRegion, useFallback, nativeMapReady]);

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
            region={safeRegion}
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
          ref={mapRef}
          style={styles.map}
          collapsable={false}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          onError={(event: { nativeEvent?: unknown }) => {
            logMapDebug(debugRunId, 'H3', 'GTAMiniMap.tsx:onError', 'native map onError fired', {
              error: event?.nativeEvent ? JSON.stringify(event.nativeEvent) : 'no-native-event',
            });
            setNativeMapFailed(true);
          }}
          onMapReady={() => {
            logMapDebug(debugRunId, 'H4', 'GTAMiniMap.tsx:onMapReady', 'native map onMapReady fired', {
              nativeMapReadyBefore: nativeMapReady,
            });
            setNativeMapReady(true);
          }}
          onMapLoaded={() => {
            logMapDebug(debugRunId, 'H4', 'GTAMiniMap.tsx:onMapLoaded', 'native map onMapLoaded fired', {
              nativeMapLoadedBefore: nativeMapLoaded,
            });
            setNativeMapLoaded(true);
          }}
          initialRegion={safeRegion}
          rotateEnabled={false}
          pitchEnabled={false}
          scrollEnabled={false}
          zoomEnabled={false}
          loadingEnabled
          loadingBackgroundColor={colors.hudVoid}
          loadingIndicatorColor={colors.gold}
          toolbarEnabled={false}
          mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        >
          {showDeparture &&
          departure &&
          Number.isFinite(departure.latitude) &&
          Number.isFinite(departure.longitude) ? (
            <Marker
              coordinate={departure}
              zIndex={1}
              title="Husko · QG"
              anchor={{ x: 0.5, y: 1 }}
              tracksViewChanges={false}
            >
              <HuskoDepartureBuilding size={34} />
            </Marker>
          ) : null}
          {showDest && dest && Number.isFinite(dest.latitude) && Number.isFinite(dest.longitude) ? (
            <Marker coordinate={dest} zIndex={2} pinColor={colors.accent} title="Livraison" />
          ) : null}
          {driver && Number.isFinite(driver.latitude) && Number.isFinite(driver.longitude) ? (
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
