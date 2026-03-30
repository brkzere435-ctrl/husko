import { Link, router } from 'expo-router';
import * as Linking from 'expo-linking';
import { memo, useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MenuItemVisual } from '@/components/westcoast/MenuItemVisual';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { DeploymentHints } from '@/components/DeploymentHints';
import { PrimaryButton } from '@/components/PrimaryButton';
import {
  CATEGORY_LABEL,
  MENU,
  type MenuCategory,
  type MenuItem,
} from '@/constants/menu';
import {
  CLIENT_PHONE_DISPLAY,
  CLIENT_PHONE_TEL,
  clientStrings,
} from '@/constants/clientExperience';
import { VENUE_TAGLINE_CLIENT } from '@/constants/venue';
import {
  deliveryHoursLabel,
  isDeliveryOpen,
  SURE_DELIVERY_WINDOW,
} from '@/constants/hours';
import { typography } from '@/constants/typography';
import { WC } from '@/constants/westCoastTheme';
import { elevation, radius, spacing } from '@/constants/theme';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { hapticLight } from '@/utils/haptics';

const MenuProductRow = memo(function MenuProductRow({ item }: { item: MenuItem }) {
  return (
    <Pressable
      onPress={() => {
        hapticLight();
        router.push(`/client/product/${item.id}`);
      }}
      android_ripple={{ color: 'rgba(34,211,238,0.15)' }}
      style={({ pressed }) => [
        styles.row,
        elevation.card,
        pressed && styles.rowPressed,
      ]}
    >
      <MenuItemVisual item={item} size="sm" />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
      </View>
      <View style={styles.pricePill}>
        <Text style={styles.priceTxt}>{item.price.toFixed(2)} €</Text>
      </View>
    </Pressable>
  );
});

const MenuCategorySection = memo(function MenuCategorySection({
  category,
  items,
}: {
  category: MenuCategory;
  items: MenuItem[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{CATEGORY_LABEL[category]}</Text>
      {items.map((m) => (
        <MenuProductRow key={m.id} item={m} />
      ))}
    </View>
  );
});

function MenuHero() {
  const open = isDeliveryOpen();
  return (
    <View style={styles.hero} accessibilityLabel={`Husko ${VENUE_TAGLINE_CLIENT}`}>
      <Text style={styles.wcBrand}>HUSKO</Text>
      <Text style={styles.wcSub}>{VENUE_TAGLINE_CLIENT}</Text>
      <View style={[styles.statusPill, open ? styles.statusOpen : styles.statusClosed]}>
        <View style={[styles.statusDot, open ? styles.statusDotOn : styles.statusDotOff]} />
        <Text style={styles.statusPillText}>{open ? clientStrings.openNow : clientStrings.closedNow}</Text>
      </View>
      <View style={styles.sureHourBanner}>
        <Text style={styles.sureHourLabel}>Créneau livraison</Text>
        <Text style={styles.sureHourValue}>{SURE_DELIVERY_WINDOW}</Text>
      </View>
      <Text style={styles.hoursSmall}>{deliveryHoursLabel()}</Text>
      <Text style={styles.menuHint}>{clientStrings.menuHint}</Text>
      <Text style={styles.trustLine}>{clientStrings.trustLine}</Text>
      <Pressable
        onPress={() => void Linking.openURL(`tel:${CLIENT_PHONE_TEL}`)}
        style={styles.phoneBtn}
        accessibilityRole="link"
        accessibilityLabel={`Appeler le ${CLIENT_PHONE_DISPLAY}`}
      >
        <Text style={styles.phoneBtnText}>{CLIENT_PHONE_DISPLAY} · Snap HUSKOBYNIGHT</Text>
      </Pressable>
    </View>
  );
}

export default function ClientMenuScreen() {
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

  const renderSection = useCallback(
    ({ item }: { item: [MenuCategory, MenuItem[]] }) => (
      <MenuCategorySection category={item[0]} items={item[1]} />
    ),
    []
  );

  const keyExtractor = useCallback(([cat]: [MenuCategory, MenuItem[]]) => cat, []);

  return (
    <WestCoastBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <FlatList
          data={sections}
          keyExtractor={keyExtractor}
          renderItem={renderSection}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={7}
          removeClippedSubviews={false}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <DeploymentHints mode="alerts" mapsRelevant={false} style={styles.hint} />
              <MenuHero />
            </View>
          }
          ListFooterComponent={
            <View style={styles.footerAbout}>
              <Link href="/client/reglages" asChild>
                <Pressable style={styles.footerLink} accessibilityRole="link" accessibilityLabel="App et mises à jour">
                  <Text style={styles.footerLinkText}>App & mises à jour</Text>
                </Pressable>
              </Link>
            </View>
          }
          contentContainerStyle={styles.list}
        />
        <View style={styles.dockWrap} pointerEvents="box-none">
          <View style={styles.dockNeon} />
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
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  list: { paddingHorizontal: spacing.md, paddingBottom: 132 },
  footerAbout: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
  },
  footerLink: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  footerLinkText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: WC.neonCyan,
    textDecorationLine: 'underline',
  },
  headerBlock: { marginBottom: spacing.sm },
  hint: { marginBottom: spacing.md },
  hero: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: WC.neonCyanDim,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  wcBrand: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 6,
    color: WC.white,
    textAlign: 'center',
    textShadowColor: WC.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  wcSub: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '700',
    color: WC.gold,
    textAlign: 'center',
    letterSpacing: 1,
  },
  statusPill: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  statusOpen: {
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    borderColor: WC.neonCyanDim,
  },
  statusClosed: {
    backgroundColor: 'rgba(127, 29, 29, 0.35)',
    borderColor: 'rgba(248, 113, 113, 0.4)',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusDotOn: { backgroundColor: WC.neonCyan },
  statusDotOff: { backgroundColor: '#fca5a5' },
  statusPillText: {
    color: WC.white,
    fontWeight: '800',
    fontSize: 12,
    flexShrink: 1,
  },
  sureHourBanner: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
    borderWidth: 1,
    borderColor: WC.neonCyanDim,
    alignItems: 'center',
  },
  sureHourLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: WC.neonCyan,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sureHourValue: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '900',
    color: WC.gold,
  },
  hoursSmall: {
    marginTop: spacing.sm,
    textAlign: 'center',
    color: 'rgba(250,250,250,0.65)',
    fontSize: 12,
    fontWeight: '600',
  },
  menuHint: {
    marginTop: spacing.md,
    color: 'rgba(250,250,250,0.75)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  trustLine: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: '700',
    color: WC.neonCyan,
    textAlign: 'center',
  },
  phoneBtn: { marginTop: spacing.md, alignSelf: 'center', paddingVertical: spacing.xs },
  phoneBtnText: {
    color: WC.gold,
    fontWeight: '800',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  section: { marginBottom: spacing.xl },
  sectionLabel: {
    marginBottom: spacing.sm,
    marginLeft: 2,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
    color: WC.neonCyan,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.2)',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  rowPressed: { opacity: 0.9 },
  rowText: { flex: 1, paddingRight: spacing.sm },
  rowTitle: {
    ...typography.body,
    color: WC.white,
    fontWeight: '800',
  },
  desc: { marginTop: 4, lineHeight: 18, color: 'rgba(250,250,250,0.6)', fontSize: 12 },
  pricePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(127, 29, 29, 0.85)',
    borderWidth: 1,
    borderColor: WC.gold,
  },
  priceTxt: {
    fontSize: 16,
    fontWeight: '900',
    color: WC.white,
    fontVariant: ['tabular-nums'],
  },
  dockWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  dockNeon: {
    height: 2,
    backgroundColor: WC.neonCyan,
    opacity: 0.85,
  },
  bar: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: 'rgba(8, 2, 4, 0.94)',
    borderTopWidth: 1,
    borderColor: 'rgba(34,211,238,0.25)',
    gap: spacing.sm,
  },
  barText: {
    ...typography.caption,
    textAlign: 'center',
    fontWeight: '700',
    color: WC.gold,
    letterSpacing: 0.3,
  },
  barBtn: { width: '100%' },
});
