import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { Platform, Pressable, View } from 'react-native';

import { SyncStatusPill } from '@/components/SyncStatusPill';
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
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: WC.brickDeep },
        headerShadowVisible: false,
        headerTintColor: WC.gold,
        headerTitleStyle: { fontWeight: '800', color: WC.white },
        contentStyle: { backgroundColor: 'transparent' },
        headerLargeTitle: Platform.OS === 'ios',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Livreur',
          headerShown: true,
          headerRight: () => <LivreurHeaderRight showSettings />,
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
  );
}
