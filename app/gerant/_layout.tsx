import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { AutonomousDemoRunner } from '@/components/AutonomousDemoRunner';
import { SyncStatusPill } from '@/components/SyncStatusPill';
import { WC } from '@/constants/westCoastTheme';

export default function GerantLayout() {
  return (
    <>
      <AutonomousDemoRunner />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: WC.brickDeep },
          headerShadowVisible: false,
          headerTintColor: WC.gold,
          headerTitleStyle: { fontWeight: '800', color: WC.white },
          contentStyle: { backgroundColor: 'transparent' },
          headerLargeTitle: Platform.OS === 'ios',
          headerRight: () => <SyncStatusPill />,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Gérant' }} />
        <Stack.Screen name="historique" options={{ title: 'Historique' }} />
        <Stack.Screen name="reglages" options={{ title: 'Réglages' }} />
        <Stack.Screen name="distribution" options={{ title: 'Distribution QR' }} />
      </Stack>
    </>
  );
}
