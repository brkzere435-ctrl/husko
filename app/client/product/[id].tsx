import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MenuItemVisual } from '@/components/westcoast/MenuItemVisual';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { appScreenVisual } from '@/constants/appScreenVisual';
import { MENU } from '@/constants/menu';
import { FONT } from '@/constants/fonts';
import { typography } from '@/constants/typography';
import { colors, radius, spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { formatEuroAmount } from '@/utils/formatEuro';
import { hapticSuccess } from '@/utils/haptics';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const addToCart = useHuskoStore((s) => s.addToCart);
  const item = MENU.find((m) => m.id === id);

  if (!item) {
    return (
      <WestCoastBackground preset="client">
        <SafeAreaView style={styles.center}>
          <Text variant="headlineSmall" style={typography.title}>
            Article introuvable
          </Text>
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
    <WestCoastBackground preset="client">
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(420).springify()}>
            <Card mode="elevated" style={styles.heroCard}>
              <Card.Content style={styles.heroCardContent}>
                <MenuItemVisual item={item} size="lg" emphasizeFrame={false} />
                <Text variant="headlineSmall" style={styles.name} accessibilityRole="header">
                  {item.name}
                </Text>
                {item.description ? (
                  <Text variant="bodyMedium" style={[typography.bodyMuted, styles.desc]}>
                    {item.description}
                  </Text>
                ) : null}
                <View style={styles.priceRow} accessibilityLabel={`Prix ${formatEuroAmount(item.price)} euros`}>
                  <Text style={styles.euro}>{formatEuroAmount(item.price)}</Text>
                  <Text style={styles.eurSym}>€</Text>
                </View>
                <Text variant="labelSmall" style={styles.tag}>
                  Prix TTC · livraison selon créneau affiché au menu
                </Text>
              </Card.Content>
            </Card>
          </Animated.View>
          <PrimaryButton title="Ajouter au panier" onPress={add} style={styles.btn} />
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
    marginBottom: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    backgroundColor: appScreenVisual.overlay028,
  },
  heroCardContent: {
    alignItems: 'center',
  },
  name: {
    ...typography.title,
    marginTop: spacing.lg,
    fontSize: 26,
    color: WC.white,
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
    fontFamily: FONT.bold,
    fontSize: 44,
    color: WC.neonCyan,
    fontVariant: ['tabular-nums'],
  },
  eurSym: {
    fontFamily: FONT.bold,
    fontSize: 22,
    fontWeight: '800',
    color: WC.gold,
    marginBottom: 8,
  },
  tag: {
    ...typography.caption,
    marginTop: spacing.md,
    fontFamily: FONT.medium,
    color: WC.neonCyanDim,
    letterSpacing: 0.8,
    textAlign: 'center',
    textTransform: 'none',
    lineHeight: 16,
  },
  btn: { marginBottom: spacing.sm },
});
