import { Stack } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AutonomousDemoRunner } from '@/components/AutonomousDemoRunner';
import { CloudLinkBanner } from '@/components/CloudLinkBanner';
import { ClientBootOverlay } from '@/components/westcoast/ClientBootOverlay';
import { SyncStatusPill } from '@/components/SyncStatusPill';
import { FONT } from '@/constants/fonts';
import { WC } from '@/constants/westCoastTheme';

export default function GerantLayout() {
  const [boot, setBoot] = useState(true);

  return (
    <View style={{ flex: 1 }}>
      <ClientBootOverlay variant="gerant" visible={boot} onDone={() => setBoot(false)} />
      <AutonomousDemoRunner />
      <CloudLinkBanner variant="gerant" />
      <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: WC.brickDeep },
          headerShadowVisible: false,
          headerTintColor: WC.gold,
          headerTitleStyle: { fontFamily: FONT.bold, color: WC.white },
          contentStyle: { backgroundColor: 'transparent' },
          headerLargeTitle: false,
          headerBackTitle: '',
          headerBackButtonDisplayMode: 'minimal',
          headerRight: () => <SyncStatusPill />,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Gérant' }} />
        <Stack.Screen name="historique" options={{ title: 'Historique' }} />
        <Stack.Screen name="reglages" options={{ title: 'Réglages' }} />
        <Stack.Screen name="distribution" options={{ title: 'Distribution QR' }} />
      </Stack>
      </View>
    </View>
  );
}
