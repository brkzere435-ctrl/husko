import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';

import { CloudLinkBanner } from '@/components/CloudLinkBanner';
import { SyncStatusPill } from '@/components/SyncStatusPill';
import { getAppVariant } from '@/constants/appVariant';
import { FONT } from '@/constants/fonts';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';
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
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'995197'},body:JSON.stringify({sessionId:'995197',runId:'run3',hypothesisId:'H8',location:'app/livreur/_layout.tsx:mount',message:'livreur layout mounted',data:{variant:getAppVariant(),remoteSyncEnabled:isRemoteSyncEnabled()},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, []);

  return (
    <View style={{ flex: 1 }}>
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
