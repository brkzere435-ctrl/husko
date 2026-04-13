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
    fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'248b3d'},body:JSON.stringify({sessionId:'248b3d',runId:'run5',hypothesisId:'H1',location:'app/client/_layout.tsx:mount',message:'client lowrider boot effect mounted',data:{bootInitial:true,variant:getAppVariant(),remoteSyncEnabled:isRemoteSyncEnabled()},timestamp:Date.now()})}).catch(()=>{});
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
    postRuntimeDebugIngest({
      runId: 'run1',
      hypothesisId: 'H1',
      location: 'app/client/_layout.tsx:useEffect',
      message: 'client layout boot mounted',
      data: {
        variant: getAppVariant(),
        remoteSyncEnabled: isRemoteSyncEnabled(),
        bootVisualVersion: CLIENT_BOOT_VISUAL_VERSION,
        bootInitial: true,
      },
    });
    // #endregion
  }, []);
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'248b3d'},body:JSON.stringify({sessionId:'248b3d',runId:'run5',hypothesisId:'H1',location:'app/client/_layout.tsx:bootState',message:'client boot visibility changed',data:{bootVisible:boot},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [boot]);
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
