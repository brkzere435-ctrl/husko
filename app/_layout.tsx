import {
  Oswald_400Regular,
  Oswald_500Medium,
  Oswald_700Bold,
  useFonts,
} from '@expo-google-fonts/oswald';
import { Stack } from 'expo-router';
import * as Updates from 'expo-updates';
import { useUpdates } from 'expo-updates';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';

import { HuskoBootSplash } from '@/components/HuskoBootSplash';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkOfflineBanner } from '@/components/NetworkOfflineBanner';
import { VariantGate } from '@/components/VariantGate';
import { useNetworkState } from '@/hooks/useNetworkState';
import { huskoPaperTheme } from '@/constants/paperTheme';
import { colors } from '@/constants/theme';
import {
  isRemoteSyncEnabled,
  subscribeToRemoteAutonomousDemo,
  subscribeToRemoteDriver,
  subscribeToRemoteOrders,
  subscribeToRemoteServiceSettings,
} from '@/services/firebaseRemote';
import { mergeRemoteOrdersWithLocal } from '@/utils/mergeRemoteOrders';
import {
  OTA_PERIODIC_CHECK_MS,
  checkAndReloadUpdatesAsync,
} from '@/services/checkAppUpdates';
import {
  configureNotificationHandler,
  notifyRemoteOrderStatusDiff,
} from '@/services/orderNotifications';
import { pickTrackedDriverOrderId, useHuskoStore } from '@/stores/useHuskoStore';
import Constants from 'expo-constants';

import { emitBootDebugProbes, isBootDebugEnabled } from '@/utils/debugProbe';
import { readHuskoExpoExtra } from '@/utils/readHuskoExpoExtra';
import { installRenderLayoutDebugTap, logRootLayoutOnce } from '@/utils/debugRenderLayoutLogs';
import { getAppVariant } from '@/constants/appVariant';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { showOfflineBanner } = useNetworkState();
  const driverOrderId = useHuskoStore((s) => pickTrackedDriverOrderId(s.orders));
  const [fontsLoaded, fontError] = useFonts({
    Oswald_400Regular,
    Oswald_500Medium,
    Oswald_700Bold,
  });
  const appReady = fontsLoaded || fontError;
  const { isUpdatePending } = useUpdates();

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const otaRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!appReady) return;
    installRenderLayoutDebugTap();
    // #region agent log — pas de POST vers localhost en release APK (téléphone ≠ PC).
    const envIngest = process.env.EXPO_PUBLIC_DEBUG_INGEST_URL?.trim();
    const debugIngestUrl =
      envIngest ||
      (__DEV__ ? 'http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42' : null);
    const mirrorConsole =
      __DEV__ || process.env.EXPO_PUBLIC_DEBUG_SESSION_MIRROR === '1';
    if (debugIngestUrl) {
      void fetch(debugIngestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': '971882',
        },
        body: JSON.stringify({
          sessionId: '971882',
          runId: 'pre',
          hypothesisId: 'H0',
          location: 'app/_layout.tsx:appReady',
          message: 'root ready ping (debug pipeline)',
          data: { variant: getAppVariant(), remoteSync: isRemoteSyncEnabled() },
          timestamp: Date.now(),
        }),
      }).catch((err: unknown) => {
        if (__DEV__ || mirrorConsole) {
          console.warn('[DEBUG_INGEST_FAIL_971882]', debugIngestUrl, err);
        }
      });
    }
    if (mirrorConsole) {
      const ndjson = JSON.stringify({
        sessionId: '971882',
        runId: 'pre',
        hypothesisId: 'H0',
        location: 'app/_layout.tsx:appReady',
        message: 'root ready ping (metro mirror — paste if debug-971882.log missing)',
        data: { variant: getAppVariant(), remoteSync: isRemoteSyncEnabled() },
        timestamp: Date.now(),
      });
      console.log('[DEBUG_NDJSON_971882]', ndjson);
    }
    // #endregion
    if (isBootDebugEnabled()) {
      const cfg = Constants.expoConfig;
      const extra = readHuskoExpoExtra();
      const splash = cfg?.splash as { image?: string } | undefined;
      emitBootDebugProbes({
        icon: cfg?.icon,
        splashImage: splash?.image,
        adaptiveForeground: cfg?.android?.adaptiveIcon?.foregroundImage,
        appVariant: String(extra.appVariant ?? ''),
        mapsAndroidKeyOk: extra.mapsAndroidKeyOk === true,
        mapsIosKeyOk: extra.mapsIosKeyOk === true,
      });
    }

    configureNotificationHandler();
    void SystemUI.setBackgroundColorAsync(colors.bg);
    void SplashScreen.hideAsync();
  }, [appReady]);

  useEffect(() => {
    if (!appReady || !isUpdatePending) return;
    void Updates.reloadAsync().catch(() => {});
  }, [appReady, isUpdatePending]);

  useEffect(() => {
    const run = () => useHuskoStore.getState().expireStalePendingOrders();
    run();
    void checkAndReloadUpdatesAsync();
    tickRef.current = setInterval(run, 60_000);
    otaRef.current = setInterval(() => void checkAndReloadUpdatesAsync(), OTA_PERIODIC_CHECK_MS);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        run();
        void checkAndReloadUpdatesAsync();
      }
    });
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (otaRef.current) clearInterval(otaRef.current);
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (!isRemoteSyncEnabled()) return;
    const variant = getAppVariant();
    // Livreur : la position vient du GPS local (setDriver + push Firestore). Écouter meta/driver
    // réinjecte une copie distante souvent périmée (stale) et peut effacer le marqueur.
    if (variant === 'livreur') {
      return;
    }
    // Client sans commande suivie : ne pas écouter le pilote global Firestore (reprise qualité + pas de « fantôme »).
    if (variant === 'client' && !driverOrderId) {
      return;
    }
    const unsubDriver = subscribeToRemoteDriver(driverOrderId, (driver, driverHeading, updatedAt) => {
      useHuskoStore.setState({ driver, driverHeading, driverPositionUpdatedAt: updatedAt });
    });
    return () => {
      unsubDriver();
    };
  }, [driverOrderId]);

  useEffect(() => {
    if (!isRemoteSyncEnabled()) return;
    const unsubOrders = subscribeToRemoteOrders(
      (remoteOrders, meta) => {
        useHuskoStore.setState((state) => {
          const merged = mergeRemoteOrdersWithLocal(remoteOrders, state.orders);
          void notifyRemoteOrderStatusDiff(state.orders, merged, state.notificationsEnabled);
          return {
            orders: merged,
            cloudSyncListenError: null,
            ordersSyncDebug: {
              updatedAt: Date.now(),
              snapDocCount: meta.snapDocCount,
              coercedCount: meta.coercedCount,
              sampleIds: remoteOrders.slice(0, 8).map((o) => o.id),
              lastMerge: {
                remoteN: remoteOrders.length,
                localN: state.orders.length,
                mergedN: merged.length,
              },
            },
          };
        });
      },
      (err) => {
        useHuskoStore.setState({ cloudSyncListenError: err.message });
      }
    );
    const unsubAuto = subscribeToRemoteAutonomousDemo((remoteAutonomousDemo) => {
      useHuskoStore.setState({ remoteAutonomousDemo });
    });
    const unsubService = subscribeToRemoteServiceSettings((settings) => {
      useHuskoStore.setState({
        remoteServiceAccepting: settings === null ? null : settings.acceptingOrders,
      });
    });
    return () => {
      unsubOrders();
      unsubAuto();
      unsubService();
    };
  }, []);

  if (!appReady) {
    return <HuskoBootSplash />;
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1 }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        logRootLayoutOnce(width, height);
      }}
    >
    <SafeAreaProvider>
      <NetworkOfflineBanner visible={showOfflineBanner} />
      <PaperProvider theme={huskoPaperTheme}>
      <ErrorBoundary>
        <VariantGate />
        <StatusBar style="light" />
        {/* Stack racine : screenOptions s’appliquent à toutes les routes fichier ; pas d’en-tête ici (les _layout enfants ont le leur). */}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </ErrorBoundary>
      </PaperProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
