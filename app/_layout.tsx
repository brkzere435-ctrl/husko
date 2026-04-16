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
  OTA_RUNTIME_ENABLED,
  checkAndReloadUpdatesAsync,
} from '@/services/checkAppUpdates';
import {
  configureNotificationHandler,
  notifyRemoteOrderStatusDiff,
} from '@/services/orderNotifications';
import type { Order } from '@/stores/useHuskoStore';
import { pickTrackedDriverOrderId, useHuskoStore } from '@/stores/useHuskoStore';
import Constants from 'expo-constants';

import { debugIngest9bf99d } from '@/utils/debugIngest9bf99d';
import { debugIngest4db8d8 } from '@/utils/debugIngest4db8d8';
import { postDebugSession21424c } from '@/utils/debugIngestSession21424c';
import { postCursorDebugIngest } from '@/utils/cursorDebugIngest';
import { emitBootDebugProbes, isBootDebugEnabled } from '@/utils/debugProbe';
import { readHuskoExpoExtra } from '@/utils/readHuskoExpoExtra';
import { installRenderLayoutDebugTap, logRootLayoutOnce } from '@/utils/debugRenderLayoutLogs';
import { getAppVariant } from '@/constants/appVariant';

SplashScreen.preventAutoHideAsync().catch(() => {});
const MIRROR_CONSOLE = __DEV__ || process.env.EXPO_PUBLIC_DEBUG_SESSION_MIRROR === '1';

function pruneClientOrdersForTracking(orders: Order[]): Order[] {
  const now = Date.now();
  const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
  const MAX_KEEP = 60;
  const pruned = orders.filter((o) => {
    if (o.status === 'pending' || o.status === 'preparing' || o.status === 'awaiting_livreur' || o.status === 'on_way') {
      return true;
    }
    return now - o.createdAt <= RECENT_WINDOW_MS;
  });
  return pruned.slice(0, MAX_KEEP);
}

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
  const driverRemoteDebugLastRef = useRef(0);

  useEffect(() => {
    if (!appReady) return;
    installRenderLayoutDebugTap();
    // #region agent log — POST uniquement si EXPO_PUBLIC_DEBUG_INGEST_URL (LAN) ou __DEV__ (localhost).
    postCursorDebugIngest(
      {
        runId: 'pre',
        hypothesisId: 'H0',
        location: 'app/_layout.tsx:appReady',
        message: 'root ready ping (debug pipeline)',
        data: { variant: getAppVariant(), remoteSync: isRemoteSyncEnabled() },
      },
      { mirrorConsole: MIRROR_CONSOLE }
    );
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
    if (!appReady || !isUpdatePending || !OTA_RUNTIME_ENABLED) return;
    // #region agent log
    postCursorDebugIngest({
      runId: `ota-pending-${Date.now().toString(36)}`,
      hypothesisId: 'H4',
      location: 'app/_layout.tsx:useEffect:isUpdatePending',
      message: 'isUpdatePending triggered reloadAsync',
      data: { appReady, isUpdatePending, otaRuntimeEnabled: OTA_RUNTIME_ENABLED },
    });
    // #endregion
    void Updates.reloadAsync().catch(() => {});
  }, [appReady, isUpdatePending]);

  useEffect(() => {
    const run = () => useHuskoStore.getState().expireStalePendingOrders();
    run();
    // #region agent log
    postCursorDebugIngest({
      runId: `ota-bootstrap-${Date.now().toString(36)}`,
      hypothesisId: 'H2',
      location: 'app/_layout.tsx:useEffect:ota-bootstrap',
      message: 'bootstrap checkAndReloadUpdatesAsync',
      data: { otaRuntimeEnabled: OTA_RUNTIME_ENABLED },
    });
    // #endregion
    if (OTA_RUNTIME_ENABLED) {
      void checkAndReloadUpdatesAsync();
    }
    tickRef.current = setInterval(run, 60_000);
    if (OTA_RUNTIME_ENABLED) {
      otaRef.current = setInterval(() => void checkAndReloadUpdatesAsync(), OTA_PERIODIC_CHECK_MS);
    }
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active' && OTA_RUNTIME_ENABLED) {
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
    const remoteOk = isRemoteSyncEnabled();
    const variant = getAppVariant();
    /** Ne pas couper le flux client quand `driverOrderId` est encore null : même logique que l’APK hub (`all`) — écoute au minimum `meta/driver`. */
    const skipReason = !remoteOk ? 'remote_off' : variant === 'livreur' ? 'livreur_local_gps' : null;

    if (skipReason !== null) {
      // #region agent log
      debugIngest9bf99d({
        runId: `driver-gate-${driverOrderId ?? 'none'}`,
        hypothesisId: 'H3',
        location: 'app/_layout.tsx:subscribeToRemoteDriver:gate',
        message: 'driver remote listener skipped',
        data: { skipReason, variant, driverOrderId, remoteOk },
      });
      postDebugSession21424c({
        hypothesisId: skipReason === 'remote_off' ? 'H1' : 'H3',
        location: 'app/_layout.tsx:subscribeToRemoteDriver:gate',
        message: 'driver remote listener skipped (21424c)',
        data: { skipReason, variant, driverOrderId, remoteOk },
        runId: 'layout-driver-gate',
      });
      // #endregion
      if (!remoteOk) return;
      if (variant === 'livreur') return;
      return;
    }

    // #region agent log
    debugIngest9bf99d({
      runId: `driver-sub-${driverOrderId ?? 'global'}`,
      hypothesisId: 'H3',
      location: 'app/_layout.tsx:subscribeToRemoteDriver:subscribe',
      message: 'driver remote listener active',
      data: { variant, driverOrderId, remoteOk },
    });
    postDebugSession21424c({
      hypothesisId: 'H3',
      location: 'app/_layout.tsx:subscribeToRemoteDriver:subscribe',
      message: 'driver remote listener active (21424c)',
      data: { variant, driverOrderId, remoteOk },
      runId: 'layout-driver-sub',
    });
    // #endregion

    const unsubDriver = subscribeToRemoteDriver(driverOrderId, (driver, driverHeading, updatedAt) => {
      const t = Date.now();
      if (t - driverRemoteDebugLastRef.current >= 7000) {
        driverRemoteDebugLastRef.current = t;
        // #region agent log
        debugIngest9bf99d({
          runId: `driver-tick-${driverOrderId ?? 'global'}`,
          hypothesisId: 'H3',
          location: 'app/_layout.tsx:subscribeToRemoteDriver:callback',
          message: 'remote driver snapshot applied to store',
          data: {
            hasDriver: !!driver,
            updatedAt,
            headingRounded: Math.round(driverHeading),
          },
        });
        postDebugSession21424c({
          hypothesisId: 'H4',
          location: 'app/_layout.tsx:subscribeToRemoteDriver:callback',
          message: 'remote driver applied to zustand (21424c)',
          data: {
            driverOrderId,
            hasDriver: !!driver,
            updatedAt,
            headingRounded: Math.round(driverHeading),
          },
          runId: 'layout-driver-callback',
        });
        // #endregion
      }
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
        const variant = getAppVariant();
        useHuskoStore.setState((state) => {
          const merged = mergeRemoteOrdersWithLocal(remoteOrders, state.orders);
          const nextOrders = variant === 'client' ? pruneClientOrdersForTracking(merged) : merged;
          // #region agent log
          debugIngest4db8d8({
            runId: 'remote-orders-flow',
            hypothesisId: 'H2',
            location: 'app/_layout.tsx:subscribeToRemoteOrders:merge',
            message: 'remote orders merged into local store',
            data: {
              variant,
              remoteCount: remoteOrders.length,
              localCount: state.orders.length,
              mergedCount: merged.length,
              nextCount: nextOrders.length,
              firstRemoteStatus: remoteOrders[0]?.status ?? null,
              firstMergedStatus: nextOrders[0]?.status ?? null,
            },
          });
          // #endregion
          void notifyRemoteOrderStatusDiff(state.orders, nextOrders, state.notificationsEnabled);
          return {
            orders: nextOrders,
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
