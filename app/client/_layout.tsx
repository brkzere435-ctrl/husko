import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { CloudLinkBanner } from '@/components/CloudLinkBanner';
import {
  CLIENT_BOOT_VISUAL_VERSION,
  ClientBootOverlay,
} from '@/components/westcoast/ClientBootOverlay';
import { SyncStatusPill } from '@/components/SyncStatusPill';
import { getAppVariant } from '@/constants/appVariant';
import { FONT } from '@/constants/fonts';
import { colors } from '@/constants/theme';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';
import { postRuntimeDebugIngest } from '@/utils/debugIngestRuntime';

export default function ClientLayout() {
  const [boot, setBoot] = useState(true);
  useEffect(() => {
    // #region agent log
    postRuntimeDebugIngest({
      runId: 'run4',
      hypothesisId: 'H11',
      location: 'app/client/_layout.tsx:mount',
      message: 'client layout mounted',
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
      <ClientBootOverlay variant="client" visible={boot} onDone={() => setBoot(false)} />
      <CloudLinkBanner variant="client" />
      <View style={{ flex: 1 }}>
      <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgLift },
        headerShadowVisible: false,
        headerTintColor: colors.gold,
        headerTitleStyle: { fontFamily: FONT.bold, color: colors.text },
        contentStyle: { backgroundColor: 'transparent' },
        headerLargeTitle: false,
        headerBackTitle: '',
        headerBackButtonDisplayMode: 'minimal',
        headerRight: () => <SyncStatusPill />,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Ton choix', headerShown: true }} />
      <Stack.Screen name="suivi" options={{ title: 'Ma livraison' }} />
      <Stack.Screen name="historique" options={{ title: 'Mes commandes' }} />
      <Stack.Screen name="reglages" options={{ title: 'App & mises à jour' }} />
    </Stack>
      </View>
    </View>
  );
}
