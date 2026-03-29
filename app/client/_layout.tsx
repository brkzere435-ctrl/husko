import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { SyncStatusPill } from '@/components/SyncStatusPill';
import { colors } from '@/constants/theme';

export default function ClientLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgLift },
        headerShadowVisible: false,
        headerTintColor: colors.gold,
        headerTitleStyle: { fontWeight: '800', color: colors.text },
        headerLargeTitle: Platform.OS === 'ios',
        headerRight: () => <SyncStatusPill />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Menu' }} />
      <Stack.Screen name="panier" options={{ title: 'Panier' }} />
      <Stack.Screen name="suivi" options={{ title: 'Livraison' }} />
    </Stack>
  );
}
