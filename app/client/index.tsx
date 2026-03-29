import { Link } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeploymentHints } from '@/components/DeploymentHints';
import { HuskoBackground } from '@/components/HuskoBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import {
  CATEGORY_LABEL,
  MENU,
  type MenuCategory,
  type MenuItem,
} from '@/constants/menu';
import { deliveryHoursLabel } from '@/constants/hours';
import { typography } from '@/constants/typography';
import { colors, elevation, radius, spacing } from '@/constants/theme';
import { useHuskoStore } from '@/stores/useHuskoStore';

function MenuHero() {
  return (
    <View style={styles.hero} accessibilityLabel="Husko, horaires de livraison">
      <Text style={typography.heroBrand}>Husko</Text>
      <Text style={typography.heroTagline}>Kebab nocturne · Angers</Text>
      <View style={styles.hoursPill}>
        <View style={styles.hoursDot} />
        <Text style={styles.hoursPillText}>{deliveryHoursLabel()}</Text>
      </View>
    </View>
  );
}

export default function ClientMenuScreen() {
  const addToCart = useHuskoStore((s) => s.addToCart);
  const cartCount = useHuskoStore((s) => s.cart.reduce((a, l) => a + l.qty, 0));
  const cartTotal = useHuskoStore((s) =>
    s.cart.reduce((a, l) => a + l.item.price * l.qty, 0)
  );

  const sections = useMemo(() => {
    const by = new Map<MenuCategory, MenuItem[]>();
    for (const item of MENU) {
      const list = by.get(item.category) ?? [];
      list.push(item);
      by.set(item.category, list);
    }
    return Array.from(by.entries());
  }, []);

  return (
    <HuskoBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <FlatList
          data={sections}
          keyExtractor={([cat]) => cat}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <DeploymentHints mode="alerts" mapsRelevant={false} style={styles.hint} />
              <MenuHero />
            </View>
          }
          contentContainerStyle={styles.list}
          renderItem={({ item: [category, items] }) => (
            <View style={styles.section}>
              <Text style={[typography.section, styles.sectionLabel]}>{CATEGORY_LABEL[category]}</Text>
              {items.map((m) => (
                <Pressable
                  key={m.id}
                  onPress={() => addToCart(m, 1)}
                  android_ripple={{ color: 'rgba(240,208,80,0.12)' }}
                  style={({ pressed }) => [
                    styles.row,
                    elevation.card,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <View style={styles.rowText}>
                    <Text style={typography.body}>{m.name}</Text>
                    {m.description ? (
                      <Text style={[typography.caption, styles.desc]}>{m.description}</Text>
                    ) : null}
                  </View>
                  <View style={styles.pricePill}>
                    <Text style={typography.price}>{m.price.toFixed(2)} €</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        />
        <View style={styles.dockWrap} pointerEvents="box-none">
          <View style={styles.dockAccent} />
          <View style={[styles.bar, elevation.dock]}>
            <Text style={styles.barText}>
              {cartCount} article{cartCount !== 1 ? 's' : ''}
              {cartTotal > 0 ? ` · ${cartTotal.toFixed(2)} €` : ''}
            </Text>
            <Link href="/client/panier" asChild>
              <PrimaryButton title="Panier" style={styles.barBtn} />
            </Link>
            <Link href="/client/suivi" asChild>
              <PrimaryButton title="Suivi" variant="ghost" style={styles.barBtn} />
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </HuskoBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  list: { paddingHorizontal: spacing.md, paddingBottom: 132 },
  headerBlock: { marginBottom: spacing.sm },
  hint: { marginBottom: spacing.md },
  hero: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    ...elevation.hero,
  },
  hoursPill: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(240, 208, 80, 0.08)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  hoursDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  hoursPillText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  section: { marginBottom: spacing.xl },
  sectionLabel: { marginBottom: spacing.sm, marginLeft: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cardElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.sm,
  },
  rowPressed: { opacity: 0.92 },
  rowText: { flex: 1, paddingRight: spacing.sm },
  desc: { marginTop: 4, lineHeight: 18 },
  pricePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: 'rgba(240, 208, 80, 0.1)',
    borderWidth: 1,
    borderColor: colors.borderGlow,
  },
  dockWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  dockAccent: {
    height: 3,
    backgroundColor: colors.goldDim,
    opacity: 0.85,
  },
  bar: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.mapOverlay,
    borderTopWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.sm,
  },
  barText: {
    ...typography.caption,
    textAlign: 'center',
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  barBtn: { width: '100%' },
});
