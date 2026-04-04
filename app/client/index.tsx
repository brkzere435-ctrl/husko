import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import * as Linking from 'expo-linking';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/BrandMark';
import { MenuItemVisual } from '@/components/westcoast/MenuItemVisual';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { DeploymentHints } from '@/components/DeploymentHints';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SyncStatusPill } from '@/components/SyncStatusPill';
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
import {
  clientMenuCart,
  clientMenuChips,
  clientMenuChrome,
  clientMenuDock,
  clientMenuHero,
  clientMenuRow,
} from '@/constants/clientMenuVisual';
import { FONT } from '@/constants/fonts';
import { typography } from '@/constants/typography';
import { WC } from '@/constants/westCoastTheme';
import { elevation, radius, spacing } from '@/constants/theme';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { buildClientMenuRows, type ClientMenuRow } from '@/utils/clientMenuRows';
import { formatEuro } from '@/utils/formatEuro';
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
        <Text style={styles.priceTxt}>{formatEuro(item.price)}</Text>
      </View>
    </Pressable>
  );
});

const MenuSectionHeaderRow = memo(function MenuSectionHeaderRow({
  category,
  isFirst,
}: {
  category: MenuCategory;
  isFirst: boolean;
}) {
  return (
    <View style={[styles.sectionHeader, isFirst && styles.sectionHeaderFirst]}>
      <Text style={styles.sectionLabel}>{CATEGORY_LABEL[category]}</Text>
    </View>
  );
});

function MenuHero() {
  const open = isDeliveryOpen();
  return (
    <LinearGradient
      colors={[...clientMenuHero.gradientColors]}
      locations={[...clientMenuHero.gradientLocations]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
      accessibilityLabel={`Husko ${VENUE_TAGLINE_CLIENT}`}
    >
      <View style={styles.heroInnerGlow} pointerEvents="none" />
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
    </LinearGradient>
  );
}

const viewabilityConfig = {
  itemVisiblePercentThreshold: 12,
  minimumViewTime: 64,
} as const;

export default function ClientMenuScreen() {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlashListRef<ClientMenuRow>>(null);
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

  const rows = useMemo(() => buildClientMenuRows(sections), [sections]);

  const categoryToHeaderIndex = useMemo(() => {
    const m = new Map<MenuCategory, number>();
    rows.forEach((r, i) => {
      if (r.type === 'header') m.set(r.category, i);
    });
    return m;
  }, [rows]);

  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>(
    () => sections[0]?.[0] ?? 'smash'
  );

  const onViewableItemsChanged = useCallback(
    ({
      viewableItems,
    }: {
      viewableItems: { item: ClientMenuRow; index: number | null }[];
    }) => {
      if (!viewableItems.length) return;
      const top = viewableItems[0]?.item;
      if (!top) return;
      let cat: MenuCategory | undefined;
      if (top.type === 'header') cat = top.category;
      else {
        const idx = rows.findIndex((r) => r.key === top.key);
        for (let i = idx; i >= 0; i--) {
          const row = rows[i];
          if (row.type === 'header') {
            cat = row.category;
            break;
          }
        }
      }
      if (cat) setSelectedCategory(cat);
    },
    [rows]
  );

  const scrollToCategory = useCallback(
    (cat: MenuCategory) => {
      const idx = categoryToHeaderIndex.get(cat);
      if (idx == null) return;
      setSelectedCategory(cat);
      listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0 });
    },
    [categoryToHeaderIndex]
  );

  const renderRow = useCallback(
    ({ item, index }: { item: ClientMenuRow; index: number }) => {
      if (item.type === 'header') {
        return <MenuSectionHeaderRow category={item.category} isFirst={index === 0} />;
      }
      return <MenuProductRow item={item.item} />;
    },
    []
  );

  const keyExtractor = useCallback((item: ClientMenuRow) => item.key, []);

  const getItemType = useCallback((item: ClientMenuRow) => item.type, []);

  return (
    <WestCoastBackground preset="client">
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <View
          style={[styles.topChrome, { paddingTop: insets.top + spacing.xs }]}
          accessibilityRole="header"
          accessibilityLabel="Husko client, à la carte"
        >
          <View style={styles.topBarRow}>
            <BrandMark compact />
            <View style={styles.topTitleCol}>
              <Text style={styles.screenTitle}>À la carte</Text>
              <Text style={styles.screenKicker}>HUSKO · BY NIGHT</Text>
            </View>
            <View style={styles.topBarActions}>
              <SyncStatusPill />
              <Link href="/client/panier" asChild>
                <Pressable
                  style={({ pressed }) => [styles.cartBtn, pressed && styles.cartBtnPressed]}
                  accessibilityRole="button"
                  accessibilityLabel={`Panier, ${cartCount} article${cartCount !== 1 ? 's' : ''}`}
                >
                  <Ionicons name="cart" size={22} color={WC.gold} />
                  {cartCount > 0 ? (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeTxt}>
                        {cartCount > 9 ? '9+' : String(cartCount)}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
        <View style={styles.screenBody}>
          <FlashList
            ref={listRef}
            data={rows}
            keyExtractor={keyExtractor}
            renderItem={renderRow}
            getItemType={getItemType}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            style={styles.listFlex}
            drawDistance={200}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.headerBlock}>
                <DeploymentHints mode="alerts" mapsRelevant style={styles.hint} />
                <MenuHero />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsScroll}
                  style={styles.chipsWrap}
                >
                  {sections.map(([cat]) => {
                    const selected = selectedCategory === cat;
                    return (
                      <Pressable
                        key={cat}
                        onPress={() => scrollToCategory(cat)}
                        style={({ pressed }) => [
                          styles.chip,
                          selected ? styles.chipOn : styles.chipOff,
                          pressed && styles.chipPressed,
                        ]}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        accessibilityLabel={`Catégorie ${CATEGORY_LABEL[cat]}`}
                      >
                        <Text style={[styles.chipTxt, selected && styles.chipTxtOn]}>
                          {CATEGORY_LABEL[cat]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
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
            contentContainerStyle={styles.listContent}
          />
          <Animated.View entering={FadeIn.duration(380).delay(60)} style={styles.dockColumn}>
            <LinearGradient
              colors={[...clientMenuDock.hairlineColors]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.dockHairline}
            />
            <View
              style={[
                styles.bar,
                elevation.dock,
                { paddingBottom: spacing.lg + Math.max(insets.bottom, 0) },
              ]}
              accessibilityLabel="Résumé panier et actions"
            >
              <Text style={styles.barText}>
                {cartCount} article{cartCount !== 1 ? 's' : ''}
                {cartTotal > 0 ? ` · ${formatEuro(cartTotal)}` : ''}
              </Text>
              <Link href="/client/panier" asChild>
                <PrimaryButton title="Panier" style={styles.barBtn} />
              </Link>
              <Link href="/client/suivi" asChild>
                <PrimaryButton title="Suivi" variant="ghost" style={styles.barBtn} />
              </Link>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  topChrome: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: clientMenuChrome.borderBottom,
    backgroundColor: clientMenuChrome.background,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  topTitleCol: { flex: 1, minWidth: 0 },
  screenTitle: {
    ...typography.title,
    color: WC.white,
    letterSpacing: 0.35,
  },
  screenKicker: {
    marginTop: 2,
    fontFamily: FONT.medium,
    fontSize: 11,
    fontWeight: '800',
    color: WC.fire,
    letterSpacing: 1.2,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: clientMenuCart.btnBorder,
    backgroundColor: clientMenuCart.btnBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBtnPressed: { opacity: 0.88 },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: clientMenuCart.badgeBg,
    borderWidth: 1,
    borderColor: clientMenuCart.badgeBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeTxt: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  chipsWrap: { marginTop: spacing.md, marginHorizontal: -spacing.md },
  chipsScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 2,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipOn: {
    backgroundColor: clientMenuChips.onBg,
    borderColor: clientMenuChips.onBorder,
  },
  chipOff: {
    backgroundColor: clientMenuChips.offBg,
    borderColor: clientMenuChips.offBorder,
  },
  chipPressed: { opacity: 0.92 },
  chipTxt: {
    fontFamily: FONT.bold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: clientMenuChips.txt,
  },
  chipTxtOn: {
    color: clientMenuChips.txtOn,
  },
  screenBody: { flex: 1 },
  listFlex: { flex: 1 },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  footerAbout: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
  },
  footerLink: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  footerLinkText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: WC.fire,
    textDecorationLine: 'underline',
  },
  headerBlock: { marginBottom: spacing.sm },
  hint: { marginBottom: spacing.md },
  hero: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: clientMenuHero.cardBorder,
    overflow: 'hidden',
    ...elevation.hero,
  },
  heroInnerGlow: {
    ...StyleSheet.absoluteFillObject,
    margin: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: clientMenuHero.innerGlowBorder,
  },
  wcBrand: {
    ...typography.heroBrand,
    letterSpacing: 4,
    color: WC.white,
    textAlign: 'center',
    textShadowColor: clientMenuHero.wcBrandTextShadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  wcSub: {
    ...typography.heroTagline,
    marginTop: spacing.sm,
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
    backgroundColor: WC.fireGlow,
    borderColor: WC.fireDim,
  },
  statusClosed: {
    backgroundColor: clientMenuHero.statusClosedBg,
    borderColor: clientMenuHero.statusClosedBorder,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusDotOn: { backgroundColor: WC.fire },
  statusDotOff: { backgroundColor: clientMenuHero.statusDotOff },
  statusPillText: {
    fontFamily: FONT.medium,
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
    backgroundColor: clientMenuHero.sureHourBannerBg,
    borderWidth: 1,
    borderColor: WC.fireDim,
    alignItems: 'center',
  },
  sureHourLabel: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '800',
    color: WC.fire,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sureHourValue: {
    fontFamily: FONT.bold,
    marginTop: 4,
    fontSize: 22,
    color: WC.gold,
  },
  hoursSmall: {
    marginTop: spacing.sm,
    textAlign: 'center',
    color: clientMenuHero.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  menuHint: {
    marginTop: spacing.md,
    color: clientMenuHero.textMutedStrong,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  trustLine: {
    marginTop: spacing.md,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    color: WC.fire,
    textAlign: 'center',
  },
  phoneBtn: { marginTop: spacing.md, alignSelf: 'center', paddingVertical: spacing.xs },
  phoneBtnText: {
    fontFamily: FONT.bold,
    color: WC.gold,
    fontWeight: '800',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  sectionHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionHeaderFirst: {
    marginTop: 0,
  },
  sectionLabel: {
    ...typography.section,
    fontSize: 13,
    marginBottom: spacing.sm,
    marginLeft: 2,
    letterSpacing: 2,
    color: WC.fire,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 80,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: clientMenuRow.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: clientMenuRow.border,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    ...elevation.card,
    shadowColor: clientMenuRow.shadowColor,
    shadowOpacity: clientMenuRow.shadowOpacity,
    shadowRadius: clientMenuRow.shadowRadius,
    shadowOffset: clientMenuRow.shadowOffset,
  },
  rowPressed: { opacity: 0.9 },
  rowText: { flex: 1, minWidth: 0, paddingRight: spacing.sm },
  rowTitle: {
    ...typography.body,
    fontFamily: FONT.bold,
    color: WC.white,
    fontSize: 16,
    letterSpacing: 0.15,
  },
  desc: {
    marginTop: 5,
    lineHeight: 19,
    color: clientMenuHero.descMuted,
    fontSize: 12.5,
    opacity: 0.92,
  },
  pricePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: clientMenuRow.pricePillBg,
    borderWidth: 1,
    borderColor: clientMenuRow.pricePillBorder,
  },
  priceTxt: {
    ...typography.price,
    fontFamily: FONT.bold,
    fontSize: 17,
    color: WC.white,
  },
  dockColumn: {
    width: '100%',
  },
  dockHairline: {
    height: 3,
    width: '100%',
    opacity: 0.95,
  },
  bar: {
    padding: spacing.md,
    backgroundColor: clientMenuDock.barBg,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: WC.fireDim,
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
