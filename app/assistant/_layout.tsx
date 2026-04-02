import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { SyncStatusPill } from '@/components/SyncStatusPill';
import { FONT } from '@/constants/fonts';
import { WC } from '@/constants/westCoastTheme';

export default function AssistantLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: WC.brickDeep },
        headerShadowVisible: false,
        headerTintColor: WC.gold,
        headerTitleStyle: { fontFamily: FONT.bold, color: WC.white },
        contentStyle: { backgroundColor: 'transparent' },
        headerLargeTitle: Platform.OS === 'ios',
        headerBackTitle: '',
        headerRight: () => <SyncStatusPill />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Copilote' }} />
      <Stack.Screen name="abonnement" options={{ title: 'Forfaits' }} />
      <Stack.Screen name="chat" options={{ title: 'Chat' }} />
      <Stack.Screen name="reglages" options={{ title: 'App & mises à jour' }} />
    </Stack>
  );
}
