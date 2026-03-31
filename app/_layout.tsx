import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { VariantGate } from '@/components/VariantGate';
import { colors } from '@/constants/theme';
import {
  isRemoteSyncEnabled,
  subscribeToRemoteAutonomousDemo,
  subscribeToRemoteDriver,
  subscribeToRemoteOrders,
} from '@/services/firebaseRemote';
import {
  OTA_PERIODIC_CHECK_MS,
  checkAndReloadUpdatesAsync,
} from '@/services/checkAppUpdates';
import { configureNotificationHandler } from '@/services/orderNotifications';
import { useHuskoStore } from '@/stores/useHuskoStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const otaRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    configureNotificationHandler();
    SystemUI.setBackgroundColorAsync(colors.bg);
    SplashScreen.hideAsync();
  }, []);

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
    const unsubOrders = subscribeToRemoteOrders((orders) => {
      useHuskoStore.setState({ orders });
    });
    const unsubDriver = subscribeToRemoteDriver((driver, driverHeading) => {
      useHuskoStore.setState({ driver, driverHeading });
    });
    const unsubAuto = subscribeToRemoteAutonomousDemo((remoteAutonomousDemo) => {
      useHuskoStore.setState({ remoteAutonomousDemo });
    });
    return () => {
      unsubOrders();
      unsubDriver();
      unsubAuto();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <VariantGate />
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bgLift },
            headerShadowVisible: false,
            headerTintColor: colors.gold,
            headerBackTitle: '',
            contentStyle: { backgroundColor: 'transparent' },
            headerTitleStyle: {
              fontWeight: '800',
              fontSize: 17,
              color: colors.text,
            },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
