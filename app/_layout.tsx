import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { VariantGate } from '@/components/VariantGate';
import { colors } from '@/constants/theme';
import {
  isRemoteSyncEnabled,
  subscribeToRemoteAutonomousDemo,
  subscribeToRemoteDriver,
  subscribeToRemoteOrders,
} from '@/services/firebaseRemote';
import { configureNotificationHandler } from '@/services/orderNotifications';
import { useHuskoStore } from '@/stores/useHuskoStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    configureNotificationHandler();
    SystemUI.setBackgroundColorAsync(colors.bg);
    SplashScreen.hideAsync();
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
    </SafeAreaProvider>
  );
}
