import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { clientMenuChrome } from '@/constants/clientMenuVisual';
import { FONT } from '@/constants/fonts';
import { typography } from '@/constants/typography';
import { WC } from '@/constants/westCoastTheme';
import { radius, spacing } from '@/constants/theme';

const ROWS = [
  { href: '/client/suivi' as const, label: 'Suivi de livraison', icon: 'navigate' as const },
  { href: '/client/historique' as const, label: 'Mes commandes', icon: 'receipt' as const },
  { href: '/client/reglages' as const, label: 'App & mises à jour', icon: 'settings' as const },
];

export default function ClientProfilScreen() {
  return (
    <WestCoastBackground preset="client">
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
          <Text style={styles.sub}>Raccourcis compte & app</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {ROWS.map((r) => (
            <Link key={r.href} href={r.href} asChild>
              <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
                <Ionicons name={r.icon} size={22} color={WC.neonOrange} />
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.35)" />
              </Pressable>
            </Link>
          ))}
        </ScrollView>
      </SafeAreaView>
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: clientMenuChrome.borderBottom,
    backgroundColor: clientMenuChrome.background,
  },
  title: {
    ...typography.title,
    color: WC.white,
    fontFamily: FONT.bold,
    fontSize: 24,
  },
  sub: {
    marginTop: spacing.xs,
    ...typography.bodyMuted,
    fontSize: 14,
  },
  scroll: { padding: spacing.md, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,69,0,0.28)',
    backgroundColor: 'rgba(12,8,14,0.75)',
  },
  rowPressed: { opacity: 0.9 },
  rowLabel: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 16,
    color: WC.white,
  },
});
