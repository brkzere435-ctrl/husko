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
import { getAppVariant } from '@/constants/appVariant';

SplashScreen.preventAutoHideAsync().catch(() => {});

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
  const lastDriverCallbackProbeRef = useRef(0);

  useEffect(() => {
    if (!appReady) return;
    configureNotificationHandler();
    void SystemUI.setBackgroundColorAsync(colors.bg);
    void SplashScreen.hideAsync();
    console.log(
      `[DBG21424c][H0] root layout ready otaEnabled=${String(OTA_RUNTIME_ENABLED)} channel=${String(Updates.channel ?? null)} updateId=${String(Updates.updateId ?? null)} embedded=${String(Updates.isEmbeddedLaunch)}`
    );
    // #region agent log
    fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'21424c'},body:JSON.stringify({sessionId:'21424c',runId:'gps-live-chain',hypothesisId:'H0',location:'app/_layout.tsx:boot',message:'root layout ready',data:{otaEnabled:OTA_RUNTIME_ENABLED,channel:Updates.channel??null,updateId:Updates.updateId??null,isEmbeddedLaunch:Updates.isEmbeddedLaunch},timestamp:Date.now()})}).catch((err)=>{console.log(`[DBG21424c][H0] boot probe failed: ${String(err)}`);});
    // #endregion
  }, [appReady]);

  useEffect(() => {
    if (!appReady || !isUpdatePending || !OTA_RUNTIME_ENABLED) return;
    void Updates.reloadAsync().catch(() => {});
  }, [appReady, isUpdatePending]);

  useEffect(() => {
    const run = () => useHuskoStore.getState().expireStalePendingOrders();
    run();
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
      return;
    }

    const unsubDriver = subscribeToRemoteDriver(driverOrderId, (driver, driverHeading, updatedAt) => {
      const now = Date.now();
      if (now - lastDriverCallbackProbeRef.current > 3000) {
        lastDriverCallbackProbeRef.current = now;
        console.log(
          `[DBG21424c][H3] remote driver applied orderId=${driverOrderId ?? 'null'} hasDriver=${String(driver != null)} updatedAt=${String(updatedAt)} heading=${Math.round(driverHeading)}`
        );
        // #region agent log
        fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'21424c'},body:JSON.stringify({sessionId:'21424c',runId:'gps-live-chain',hypothesisId:'H3',location:'app/_layout.tsx:subscribeToRemoteDriver:callback',message:'client remote driver snapshot applied',data:{driverOrderId,hasDriver:driver!=null,updatedAt},timestamp:Date.now()})}).catch(()=>{});
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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
