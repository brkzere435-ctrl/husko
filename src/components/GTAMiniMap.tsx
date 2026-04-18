import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { GTAHudFrame } from '@/components/GTAHudFrame';
import { GTAMiniMapFallbackInterior } from '@/components/GTAMiniMapFallbackInterior';
import { HuskoDepartureBuilding } from '@/components/HuskoDepartureBuilding';
import { HUSKO_DEPARTURE_HUB } from '@/constants/huskoDepartureHub';
import { colors, elevation } from '@/constants/theme';
import type { MapRegion } from '@/types/mapRegion';
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
  const mapsConfigured = isMapsKeyConfiguredForPlatform();
  const preferDeviceFallback = useMemo(() => shouldPreferMiniMapFallback(), []);
  const safeRegion = useMemo(() => sanitizeMapRegion(region), [region]);
  const [nativeMapFailed, setNativeMapFailed] = useState(false);
  const [nativeMapReady, setNativeMapReady] = useState(false);
  const [nativeMapLoaded, setNativeMapLoaded] = useState(false);
  /**
   * Google Maps Android API token can be INVALID_ARGUMENT on some Android targets.
   * Force Android fallback to keep map usable and avoid black-map retries.
   */
  const forceAndroidFallback = Platform.OS === 'android';
  /** Clé absente, échec runtime, ou appareil sensible MapView noir → radar GTA. */
  const useFallback =
    forceFallback || forceAndroidFallback || nativeMapFailed || !mapsConfigured || preferDeviceFallback;
  const footerTag = useFallback ? `${hudFooter} · OSM` : hudFooter;

  /** Ne pas couper MapView avant chargement GMS : 3,5 s démontait la carte sur téléphones réels. */
  const NATIVE_MAP_FAILSAFE_MS = 4_000;
  useEffect(() => {
    if (useFallback) return;
    if (nativeMapReady) return;
    const timer = setTimeout(() => {
      setNativeMapFailed(true);
    }, NATIVE_MAP_FAILSAFE_MS);
    return () => clearTimeout(timer);
  }, [nativeMapReady, useFallback]);

  /**
   * Cas réel observé en prod: GMS répond "API token INVALID_ARGUMENT", MapView peut être "ready"
   * mais rester visuellement noir. Si la carte n'est jamais "loaded", bascule proprement en radar.
   */
  const NATIVE_MAP_LOADED_FAILSAFE_MS = 1500;
  useEffect(() => {
    if (useFallback) return;
    if (!nativeMapReady || nativeMapLoaded) return;
    const timer = setTimeout(() => {
      setNativeMapFailed(true);
    }, NATIVE_MAP_LOADED_FAILSAFE_MS);
    return () => clearTimeout(timer);
  }, [nativeMapLoaded, nativeMapReady, useFallback]);

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
        <View style={styles.mapStack}>
          <GTAMiniMapFallbackInterior
            region={safeRegion}
            driver={driver}
            headingDeg={headingDeg}
            dest={dest}
            showDest={showDest}
            departure={departure}
            showDeparture={showDeparture}
          />
          <MapView
            ref={mapRef}
            style={[styles.map, !nativeMapLoaded && styles.mapHidden]}
            collapsable={false}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            onError={() => {
              setNativeMapFailed(true);
            }}
            onMapReady={() => {
              setNativeMapReady(true);
            }}
            onMapLoaded={() => {
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
        </View>
      </GTAHudFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  mapStack: { ...StyleSheet.absoluteFillObject },
  map: { ...StyleSheet.absoluteFillObject },
  mapHidden: { opacity: 0.01 },
});
