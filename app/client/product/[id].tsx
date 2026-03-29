import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MenuItemVisual } from '@/components/westcoast/MenuItemVisual';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { MENU } from '@/constants/menu';
import { typography } from '@/constants/typography';
import { WC } from '@/constants/westCoastTheme';
import { radius, spacing } from '@/constants/theme';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { hapticSuccess } from '@/utils/haptics';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const addToCart = useHuskoStore((s) => s.addToCart);
  const item = MENU.find((m) => m.id === id);

  if (!item) {
    return (
      <WestCoastBackground>
        <SafeAreaView style={styles.center}>
          <Text style={typography.title}>Article introuvable</Text>
          <PrimaryButton title="Retour" onPress={() => router.back()} />
        </SafeAreaView>
      </WestCoastBackground>
    );
  }

  function add() {
    if (!item) return;
    addToCart(item, 1);
    hapticSuccess();
    router.back();
  }

  return (
    <WestCoastBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <MenuItemVisual item={item} size="lg" />
            <Text style={styles.name}>{item.name}</Text>
            {item.description ? (
              <Text style={[typography.bodyMuted, styles.desc]}>{item.description}</Text>
            ) : null}
            <View style={styles.priceRow}>
              <Text style={styles.euro}>{item.price.toFixed(2)}</Text>
              <Text style={styles.eurSym}>€</Text>
            </View>
            <Text style={styles.tag}>West Coast street food · Angers</Text>
          </View>
          <PrimaryButton title="Valider & ajouter au panier" onPress={add} style={styles.btn} />
          <PrimaryButton title="Retour au menu" variant="ghost" onPress={() => router.back()} />
        </ScrollView>
      </SafeAreaView>
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, padding: spacing.lg, justifyContent: 'center', gap: spacing.md },
  scroll: { padding: spacing.lg, paddingBottom: 48 },
  heroCard: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: WC.neonCyanDim,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  name: {
    marginTop: spacing.lg,
    color: WC.white,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: WC.shadow,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  desc: { marginTop: spacing.sm, textAlign: 'center', maxWidth: 320 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.lg,
    gap: 4,
  },
  euro: {
    fontSize: 44,
    fontWeight: '900',
    color: WC.neonCyan,
    fontVariant: ['tabular-nums'],
  },
  eurSym: {
    fontSize: 22,
    fontWeight: '800',
    color: WC.gold,
    marginBottom: 8,
  },
  tag: {
    marginTop: spacing.md,
    fontSize: 11,
    fontWeight: '700',
    color: WC.neonCyan,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  btn: { marginBottom: spacing.sm },
});
