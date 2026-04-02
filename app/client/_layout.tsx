import { Stack } from 'expo-router';
import { useState } from 'react';
import { Platform } from 'react-native';

import { ClientBootOverlay } from '@/components/westcoast/ClientBootOverlay';
import { SyncStatusPill } from '@/components/SyncStatusPill';
import { FONT } from '@/constants/fonts';
import { colors } from '@/constants/theme';

export default function ClientLayout() {
  const [boot, setBoot] = useState(true);
  return (
    <>
      <ClientBootOverlay visible={boot} onDone={() => setBoot(false)} />
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgLift },
        headerShadowVisible: false,
        headerTintColor: colors.gold,
        headerTitleStyle: { fontFamily: FONT.bold, color: colors.text },
        contentStyle: { backgroundColor: 'transparent' },
        headerLargeTitle: Platform.OS === 'ios',
        headerRight: () => <SyncStatusPill />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'À la carte', headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Ton choix', headerShown: true }} />
      <Stack.Screen name="panier" options={{ title: 'Mon panier' }} />
      <Stack.Screen name="suivi" options={{ title: 'Ma livraison' }} />
      <Stack.Screen name="historique" options={{ title: 'Mes commandes' }} />
      <Stack.Screen name="reglages" options={{ title: 'App & mises à jour' }} />
    </Stack>
    </>
  );
}
