import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { CloudLinkBanner } from '@/components/CloudLinkBanner';
import { ClientBootOverlay, CLIENT_BOOT_VISUAL_VERSION } from '@/components/westcoast/ClientBootOverlay';
import { SyncStatusPill } from '@/components/SyncStatusPill';
import { getAppVariant } from '@/constants/appVariant';
import { FONT } from '@/constants/fonts';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';
import { postRuntimeDebugIngest } from '@/utils/debugIngestRuntime';
import { WC } from '@/constants/westCoastTheme';

function LivreurHeaderRight({ showSettings }: { showSettings: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {showSettings ? (
        <Link href="/livreur/reglages" asChild>
          <Pressable
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Réglages et mises à jour"
            style={{ marginRight: 6, padding: 4 }}
          >
            <Ionicons name="settings-outline" size={24} color={WC.gold} />
          </Pressable>
        </Link>
      ) : null}
      <SyncStatusPill />
    </View>
  );
}

export default function LivreurLayout() {
  const [boot, setBoot] = useState(true);
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'248b3d'},body:JSON.stringify({sessionId:'248b3d',runId:'run5',hypothesisId:'H1',location:'app/livreur/_layout.tsx:mount',message:'livreur lowrider boot effect mounted',data:{bootInitial:true,variant:getAppVariant(),remoteSyncEnabled:isRemoteSyncEnabled()},timestamp:Date.now()})}).catch(()=>{});
    postRuntimeDebugIngest({
      runId: 'run3',
      hypothesisId: 'H8',
      location: 'app/livreur/_layout.tsx:mount',
      message: 'livreur layout mounted',
      data: {
        variant: getAppVariant(),
        remoteSyncEnabled: isRemoteSyncEnabled(),
        bootVisualVersion: CLIENT_BOOT_VISUAL_VERSION,
      },
    });
    postRuntimeDebugIngest({
      runId: 'run1',
      hypothesisId: 'H1',
      location: 'app/livreur/_layout.tsx:mount',
      message: 'livreur layout boot mounted',
      data: {
        variant: getAppVariant(),
        remoteSyncEnabled: isRemoteSyncEnabled(),
        bootVisualVersion: CLIENT_BOOT_VISUAL_VERSION,
      },
    });
    // #endregion
  }, []);
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'248b3d'},body:JSON.stringify({sessionId:'248b3d',runId:'run5',hypothesisId:'H1',location:'app/livreur/_layout.tsx:bootState',message:'livreur boot visibility changed',data:{bootVisible:boot},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [boot]);

  return (
    <View style={{ flex: 1 }}>
      <ClientBootOverlay variant="livreur" visible={boot} onDone={() => setBoot(false)} />
      <CloudLinkBanner variant="livreur" />
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
            headerRight: () => <LivreurHeaderRight showSettings />,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Livreur',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="reglages"
            options={{
              title: 'Réglages',
              headerRight: () => <LivreurHeaderRight showSettings={false} />,
            }}
          />
        </Stack>
      </View>
    </View>
  );
}
