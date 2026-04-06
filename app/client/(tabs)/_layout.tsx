import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { FONT } from '@/constants/fonts';
import { WC } from '@/constants/westCoastTheme';

export default function ClientTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: WC.neonOrange,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
        tabBarStyle: {
          backgroundColor: 'rgba(5,4,8,0.97)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,69,0,0.35)',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        },
        tabBarLabelStyle: {
          fontFamily: FONT.bold,
          fontSize: 11,
          letterSpacing: 0.4,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => <Ionicons name="restaurant" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="panier"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
