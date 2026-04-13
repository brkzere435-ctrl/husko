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
import { postRuntimeDebugIngest, postSessionA64698Ingest } from '@/utils/debugIngestRuntime';

export default function GerantLayout() {
  const supportDebugEnabled =
    __DEV__ || process.env.EXPO_PUBLIC_HUSKO_DEBUG_BOOT === '1';
  const [boot, setBoot] = useState(true);
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'248b3d'},body:JSON.stringify({sessionId:'248b3d',runId:'run5',hypothesisId:'H1',location:'app/gerant/_layout.tsx:mountGuard',message:'gerant layout mount guard evaluated',data:{bootInitial:boot,supportDebugEnabled,variant:getAppVariant()},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!supportDebugEnabled) return;
    // #region agent log
    postSessionA64698Ingest({
      location: 'app/gerant/_layout.tsx:boot',
      message: 'ClientBootOverlay visibility',
      data: { bootVisible: boot, variant: getAppVariant() },
      runId: 'pre',
      hypothesisId: 'H4',
    });
    console.warn(
      '[HUSKO_DEBUG_a64698_H4]',
      JSON.stringify({ bootVisible: boot, variant: getAppVariant() })
    );
    // #endregion
  }, [boot, supportDebugEnabled]);

  useEffect(() => {
    if (!supportDebugEnabled) return;
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
    postRuntimeDebugIngest({
      runId: 'run1',
      hypothesisId: 'H1',
      location: 'app/gerant/_layout.tsx:mount',
      message: 'gerant layout boot mounted',
      data: {
        variant: getAppVariant(),
        remoteSyncEnabled: isRemoteSyncEnabled(),
        bootVisualVersion: CLIENT_BOOT_VISUAL_VERSION,
        supportDebugEnabled,
      },
    });
    // #endregion
  }, [supportDebugEnabled]);
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'248b3d'},body:JSON.stringify({sessionId:'248b3d',runId:'run5',hypothesisId:'H1',location:'app/gerant/_layout.tsx:bootState',message:'gerant boot visibility changed',data:{bootVisible:boot},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [boot]);

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
