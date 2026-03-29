import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';

export default function AssistantLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgLift },
        headerShadowVisible: false,
        headerTintColor: colors.gold,
        headerTitleStyle: { fontWeight: '800', color: colors.text },
        contentStyle: { backgroundColor: 'transparent' },
        headerBackTitle: '',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Assistant' }} />
      <Stack.Screen name="abonnement" options={{ title: 'Forfaits' }} />
      <Stack.Screen name="chat" options={{ title: 'Conversation' }} />
    </Stack>
  );
}
