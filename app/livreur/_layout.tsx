import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { CloudLinkBanner } from '@/components/CloudLinkBanner';
import { ClientBootOverlay } from '@/components/westcoast/ClientBootOverlay';
import { SyncStatusPill } from '@/components/SyncStatusPill';
import { FONT } from '@/constants/fonts';
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
  /**
   * Splash plein écran désactivé : sur plusieurs Samsung / Android 15, le Modal pouvait rester
   * bloquant ou laisser l’écran principal sans hauteur utile après fermeture.
   * Réactiver seulement si besoin marketing : useState(true) + tester Retour + timer.
   */
  const [boot, setBoot] = useState(false);

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
