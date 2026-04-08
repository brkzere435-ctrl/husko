import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AutonomousDemoRunner } from '@/components/AutonomousDemoRunner';
import { CloudLinkBanner } from '@/components/CloudLinkBanner';
import { ClientBootOverlay, CLIENT_BOOT_VISUAL_VERSION } from '@/components/westcoast/ClientBootOverlay';
import { SyncStatusPill } from '@/components/SyncStatusPill';
import { FONT } from '@/constants/fonts';
import { getAppVariant } from '@/constants/appVariant';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';
import { WC } from '@/constants/westCoastTheme';
import { postRuntimeDebugIngest } from '@/utils/debugIngestRuntime';

export default function GerantLayout() {
  const [boot, setBoot] = useState(true);
  useEffect(() => {
    // #region agent log
    postRuntimeDebugIngest({
      runId: 'run4',
      hypothesisId: 'H10',
      location: 'app/gerant/_layout.tsx:mount',
      message: 'gerant layout mounted',
      data: {
        variant: getAppVariant(),
        remoteSyncEnabled: isRemoteSyncEnabled(),
        bootVisualVersion: CLIENT_BOOT_VISUAL_VERSION,
      },
    });
    // #endregion
  }, []);

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
