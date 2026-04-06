import {
  Oswald_400Regular,
  Oswald_500Medium,
  Oswald_700Bold,
  useFonts,
} from '@expo-google-fonts/oswald';
import { Stack } from 'expo-router';
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
import { configureNotificationHandler } from '@/services/orderNotifications';
import { useHuskoStore } from '@/stores/useHuskoStore';
import Constants from 'expo-constants';

import { debugAgentLog } from '@/utils/debugAgentLog';
import { emitBootDebugProbes, isBootDebugEnabled } from '@/utils/debugProbe';
import { readHuskoExpoExtra } from '@/utils/readHuskoExpoExtra';
import { installRenderLayoutDebugTap, logRootLayoutOnce } from '@/utils/debugRenderLayoutLogs';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { showOfflineBanner } = useNetworkState();
  const [fontsLoaded, fontError] = useFonts({
    Oswald_400Regular,
    Oswald_500Medium,
    Oswald_700Bold,
  });
  const appReady = fontsLoaded || fontError;

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const otaRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!appReady) return;
    installRenderLayoutDebugTap();
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
    const run = () => useHuskoStore.getState().expireStalePendingOrders();
    run();
    const upd = setTimeout(() => void checkAndReloadUpdatesAsync(), 2800);
    tickRef.current = setInterval(run, 60_000);
    otaRef.current = setInterval(() => void checkAndReloadUpdatesAsync(), OTA_PERIODIC_CHECK_MS);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        run();
        void checkAndReloadUpdatesAsync();
      }
    });
    return () => {
      clearTimeout(upd);
      if (tickRef.current) clearInterval(tickRef.current);
      if (otaRef.current) clearInterval(otaRef.current);
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (!isRemoteSyncEnabled()) return;
    const unsubOrders = subscribeToRemoteOrders(
      (remoteOrders, meta) => {
        useHuskoStore.setState((state) => {
          const merged = mergeRemoteOrdersWithLocal(remoteOrders, state.orders);
          debugAgentLog({
            location: 'app/_layout.tsx:mergeRemoteOrders',
            message: 'after merge',
            hypothesisId: 'H4',
            data: {
              remoteN: remoteOrders.length,
              localN: state.orders.length,
              mergedN: merged.length,
              snapDocCount: meta.snapDocCount,
              coercedCount: meta.coercedCount,
            },
          });
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
        debugAgentLog({
          location: 'app/_layout.tsx:onListenError',
          message: 'layout listen error',
          hypothesisId: 'H2',
          data: { err: err.message },
        });
        useHuskoStore.setState({ cloudSyncListenError: err.message });
      }
    );
    const unsubDriver = subscribeToRemoteDriver((driver, driverHeading) => {
      useHuskoStore.setState({ driver, driverHeading });
    });
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
      unsubDriver();
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
