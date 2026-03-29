import { Stack } from 'expo-router';

import { AutonomousDemoRunner } from '@/components/AutonomousDemoRunner';
import { SyncStatusPill } from '@/components/SyncStatusPill';
import { colors } from '@/constants/theme';

export default function GerantLayout() {
  return (
    <>
      <AutonomousDemoRunner />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bgLift },
          headerShadowVisible: false,
          headerTintColor: colors.gold,
          headerTitleStyle: { fontWeight: '800', color: colors.text },
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
