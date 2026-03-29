import { Link } from 'expo-router';
import * as Linking from 'expo-linking';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/BrandMark';
import { DeploymentHints } from '@/components/DeploymentHints';
import { HuskoBackground } from '@/components/HuskoBackground';
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
import { colors, elevation, radius, spacing } from '@/constants/theme';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { hapticLight } from '@/utils/haptics';

function MenuHero() {
  const open = isDeliveryOpen();
  return (
    <View
      style={styles.hero}
      accessibilityLabel={`Husko sandwicherie ${VENUE_TAGLINE_CLIENT}, ${deliveryHoursLabel()}`}
    >
      <BrandMark tagline={VENUE_TAGLINE_CLIENT} />
      <View style={[styles.statusPill, open ? styles.statusOpen : styles.statusClosed]}>
        <View style={[styles.statusDot, open ? styles.statusDotOn : styles.statusDotOff]} />
        <Text style={styles.statusPillText}>{open ? clientStrings.openNow : clientStrings.closedNow}</Text>
      </View>
      <View style={styles.sureHourBanner}>
        <Text style={styles.sureHourLabel}>Heure de livraison</Text>
        <Text style={styles.sureHourValue}>{SURE_DELIVERY_WINDOW}</Text>
      </View>
      <View style={styles.hoursPill}>
        <View style={styles.hoursDot} />
        <Text style={styles.hoursPillText}>{deliveryHoursLabel()}</Text>
      </View>
      <Text style={styles.menuHint}>{clientStrings.menuHint}</Text>
      <Text style={styles.trustLine}>{clientStrings.trustLine}</Text>
      <Pressable
        onPress={() => void Linking.openURL(`tel:${CLIENT_PHONE_TEL}`)}
        style={styles.phoneBtn}
        accessibilityRole="link"
        accessibilityLabel={`Appeler le ${CLIENT_PHONE_DISPLAY}`}
      >
        <Text style={styles.phoneBtnText}>Une question ? {CLIENT_PHONE_DISPLAY}</Text>
      </Pressable>
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
                  onPress={() => {
                    addToCart(m, 1);
                    hapticLight();
                  }}
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
  statusPill: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  statusOpen: {
    backgroundColor: 'rgba(34, 160, 80, 0.12)',
    borderColor: 'rgba(80, 200, 120, 0.45)',
  },
  statusClosed: {
    backgroundColor: 'rgba(120, 40, 40, 0.2)',
    borderColor: colors.borderSubtle,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusDotOn: { backgroundColor: '#4ade80' },
  statusDotOff: { backgroundColor: colors.textMuted },
  statusPillText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '800',
    flexShrink: 1,
  },
  sureHourBanner: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(240, 208, 80, 0.12)',
    borderWidth: 1,
    borderColor: colors.goldDim,
    alignItems: 'center',
  },
  sureHourLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sureHourValue: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '900',
    color: colors.gold,
    letterSpacing: 0.5,
  },
  hoursPill: {
    marginTop: spacing.sm,
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
  menuHint: {
    marginTop: spacing.md,
    ...typography.bodyMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  trustLine: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: '700',
    color: colors.goldDim,
    letterSpacing: 0.4,
  },
  phoneBtn: { marginTop: spacing.md, alignSelf: 'flex-start', paddingVertical: spacing.xs },
  phoneBtnText: {
    color: colors.gold,
    fontWeight: '800',
    fontSize: 15,
    textDecorationLine: 'underline',
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
