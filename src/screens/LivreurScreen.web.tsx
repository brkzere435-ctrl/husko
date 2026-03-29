import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CarMarkerIcon } from '@/components/CarMarkerIcon';
import { DeploymentHints } from '@/components/DeploymentHints';
import { GTAMiniMap } from '@/components/GTAMiniMap';
import { HuskoBackground } from '@/components/HuskoBackground';
import { LivreurAppGate } from '@/components/LivreurAppGate';
import { LivreurOrderPanel } from '@/components/LivreurOrderPanel';
import { colors, radius, spacing } from '@/constants/theme';
import type { MapRegion } from '@/types/mapRegion';
import { ANGERS_DEFAULT, useHuskoStore } from '@/stores/useHuskoStore';

/** Livreur sur navigateur : pas de react-native-maps — fond + mini-carte + géoloc si autorisée. */
export default function LivreurScreenWeb() {
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

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Localisation',
          'Autorisez la position dans le navigateur pour mettre à jour le suivi (ou utilisez l’app mobile pour la carte complète).'
        );
        return;
      }
      subRef.current?.remove();
      subRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
        },
        (loc) => {
          if (cancelled) return;
          const lat = loc.coords.latitude;
          const lng = loc.coords.longitude;
          const raw = loc.coords.heading;
          const heading = typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
          setDriver({ latitude: lat, longitude: lng }, heading);
          setRegion((r) => ({ ...r, latitude: lat, longitude: lng }));
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

  const miniRegion: MapRegion = {
    latitude: region.latitude,
    longitude: region.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <LivreurAppGate>
      <HuskoBackground>
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

          <DeploymentHints mode="alerts" mapsRelevant={false} />

          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <View style={styles.placeholderInner}>
                {driver ? (
                  <View style={styles.bigMarker}>
                    <CarMarkerIcon headingDeg={driverHeading} size={56} variant="lowrider" />
                  </View>
                ) : (
                  <Ionicons name="car-sport" size={48} color={colors.goldDim} />
                )}
                <Text style={styles.placeholderTitle}>Carte Google Maps</Text>
                <Text style={styles.placeholderSub}>
                  Vue complète sur l’application Android / iOS. Ici : suivi simplifié + géoloc navigateur.
                </Text>
              </View>
            </View>

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
        </SafeAreaView>
      </HuskoBackground>
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
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.mapOverlay,
  },
  toolbarLabel: { color: colors.text, fontWeight: '700' },
  mapContainer: { flex: 1, position: 'relative' },
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 4, 4, 0.92)',
    borderTopWidth: 1,
    borderColor: colors.borderSubtle,
  },
  placeholderInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  bigMarker: { marginBottom: spacing.md },
  placeholderTitle: {
    color: colors.gold,
    fontWeight: '900',
    fontSize: 16,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  placeholderSub: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
    maxWidth: 320,
  },
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
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.mapOverlay,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderGlow,
  },
  hudPulse: { opacity: 0.95 },
  hudText: { color: colors.gold, fontWeight: '900', fontSize: 11, letterSpacing: 2 },
});
