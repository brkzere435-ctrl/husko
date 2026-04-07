import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { AutonomousDemoRunner } from '@/components/AutonomousDemoRunner';
import { CloudLinkBanner } from '@/components/CloudLinkBanner';
import { SyncStatusPill } from '@/components/SyncStatusPill';
import { FONT } from '@/constants/fonts';
import { getAppVariant } from '@/constants/appVariant';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';
import { WC } from '@/constants/westCoastTheme';

export default function GerantLayout() {
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'995197'},body:JSON.stringify({sessionId:'995197',runId:'run4',hypothesisId:'H10',location:'app/gerant/_layout.tsx:mount',message:'gerant layout mounted',data:{variant:getAppVariant(),remoteSyncEnabled:isRemoteSyncEnabled()},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, []);

  return (
    <View style={{ flex: 1 }}>
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
