import { Stack } from 'expo-router';

import { SyncStatusPill } from '@/components/SyncStatusPill';
import { colors } from '@/constants/theme';

export default function LivreurLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgLift },
        headerShadowVisible: false,
        headerTintColor: colors.gold,
        headerTitleStyle: { fontWeight: '800', color: colors.text },
        contentStyle: { backgroundColor: 'transparent' },
        headerRight: () => <SyncStatusPill />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Livreur', headerShown: true }} />
    </Stack>
  );
}
