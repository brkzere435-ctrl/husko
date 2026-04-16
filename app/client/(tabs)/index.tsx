import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SyncStatusPill } from '@/components/SyncStatusPill';
import { CLIENT_BOOT_HERO } from '@/constants/brandingAssets';
import { clientHomeVisual, clientMenuChrome } from '@/constants/clientMenuVisual';
import {
  deliveryHoursLabel,
  isClientOrderingAllowed,
  SURE_DELIVERY_WINDOW,
} from '@/constants/hours';
import { FONT } from '@/constants/fonts';
import { typography } from '@/constants/typography';
import { WC } from '@/constants/westCoastTheme';
import { radius, spacing } from '@/constants/theme';
import { VENUE_TAGLINE_CLIENT } from '@/constants/venue';
import { clientStrings } from '@/constants/clientExperience';
import { ORDER_STATUS_LABEL } from '@/constants/orderStatus';
import { pickPrimaryActiveOrder, useHuskoStore } from '@/stores/useHuskoStore';

const HERO_IMG = CLIENT_BOOT_HERO;

export default function ClientHomeScreen() {
  const insets = useSafeAreaInsets();
  const orders = useHuskoStore((s) => s.orders);
  const activeOrder = useMemo(() => pickPrimaryActiveOrder(orders), [orders]);
  const remoteServiceAccepting = useHuskoStore((s) => s.remoteServiceAccepting);
  const orderingOpen = isClientOrderingAllowed(new Date(), remoteServiceAccepting);
  const pillStatusLabel = orderingOpen
    ? clientStrings.openNow
    : remoteServiceAccepting === false
      ? clientStrings.orderingClosedByRestaurant
      : clientStrings.orderingClosedHours;
  const tabBarReserve = 72;

  return (
    <WestCoastBackground preset="client">
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={[styles.topBar, { paddingTop: spacing.xs }]}>
          <View style={styles.topBarRow}>
            <View style={styles.logoBlock}>
              <Text style={styles.brandNeon}>HUSKO</Text>
              <Text style={styles.brandSub}>By Night</Text>
            </View>
            <View style={styles.locBlock}>
              <Ionicons name="location" size={16} color="rgba(252, 211, 77, 0.95)" />
              <Text style={styles.locText}>Angers, France</Text>
            </View>
            <SyncStatusPill />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: tabBarReserve + insets.bottom + 88 }]}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[...clientHomeVisual.heroCardGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroImageWrap}>
              <Image
                source={HERO_IMG}
                style={styles.heroImage}
                contentFit="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(5,4,8,0.85)']}
                style={styles.heroImageFade}
              />
            </View>
            <Text style={styles.heroKicker}>STREET FOOD · WEST COAST</Text>
            <Text style={styles.heroTitle}>SMASH WEST COAST</Text>
            <Text style={styles.heroTag}>{VENUE_TAGLINE_CLIENT}</Text>
            <View style={[styles.pill, orderingOpen ? styles.pillOpen : styles.pillClosed]}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: orderingOpen ? WC.statusOpenNeon : WC.statusClosedNeon,
                  },
                ]}
              />
              <Text style={styles.pillTxt}>
                {pillStatusLabel} · {SURE_DELIVERY_WINDOW}
              </Text>
            </View>
            <Text style={styles.hoursLine}>{deliveryHoursLabel()}</Text>
          </LinearGradient>

          {activeOrder ? (
            <Link href="/client/suivi" asChild>
              <Pressable
                style={styles.activeOrderStrip}
                accessibilityRole="button"
                accessibilityLabel={`Suivi de commande, ${ORDER_STATUS_LABEL[activeOrder.status]}`}
              >
                <Ionicons name="navigate-circle" size={26} color="rgba(252, 211, 77, 0.95)" />
                <View style={styles.activeOrderTextCol}>
                  <Text style={styles.activeOrderKicker}>COMMANDE EN COURS</Text>
                  <Text style={styles.activeOrderStatus} numberOfLines={1}>
                    {ORDER_STATUS_LABEL[activeOrder.status]}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.75)" />
              </Pressable>
            </Link>
          ) : null}

          <View style={styles.ctaRow}>
            <PrimaryButton title="Voir le menu" onPress={() => router.push('/client/menu')} />
            <Link href="/client/suivi" asChild>
              <PrimaryButton title="Suivi livraison" variant="ghost" />
            </Link>
          </View>
        </ScrollView>

        <Link href="/client/menu" asChild>
          <Pressable
            style={[styles.fab, { bottom: tabBarReserve + insets.bottom + 8 }]}
            accessibilityRole="button"
            accessibilityLabel="Commande — ouvrir le menu"
          >
            <LinearGradient
              colors={[...clientHomeVisual.fabGradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabInner}
            >
              <Ionicons name="flame" size={22} color="rgba(252, 211, 77, 0.95)" />
              <Text style={styles.fabTxt}>Commande</Text>
            </LinearGradient>
          </Pressable>
        </Link>
      </SafeAreaView>
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  topBar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: clientMenuChrome.borderBottom,
    backgroundColor: clientMenuChrome.background,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  logoBlock: { flex: 1, minWidth: 0 },
  brandNeon: {
    fontFamily: FONT.bold,
    fontSize: 22,
    letterSpacing: 3,
    color: WC.white,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  brandSub: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: 'rgba(252, 211, 77, 0.92)',
    letterSpacing: 2,
    marginTop: 2,
  },
  locBlock: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: 120 },
  locText: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    flexShrink: 1,
  },
  scroll: { padding: spacing.md },
  heroCard: {
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: clientHomeVisual.heroCardBorder,
    overflow: 'hidden',
    paddingBottom: spacing.lg,
  },
  heroImageWrap: { width: '100%', height: 200 },
  heroImage: { width: '100%', height: '100%' },
  heroImageFade: { ...StyleSheet.absoluteFillObject },
  heroKicker: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.9)',
  },
  heroTitle: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    fontFamily: FONT.bold,
    fontSize: 28,
    letterSpacing: 1,
    color: WC.white,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroTag: {
    ...typography.bodyMuted,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,250,245,0.88)',
  },
  pill: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  pillOpen: {
    backgroundColor: clientHomeVisual.statusPillOpenBg,
    borderColor: clientHomeVisual.statusPillOpenBorder,
  },
  pillClosed: {
    backgroundColor: clientHomeVisual.statusPillClosedBg,
    borderColor: clientHomeVisual.statusPillClosedBorder,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  pillTxt: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: WC.white,
    fontWeight: '700',
  },
  hoursLine: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
  },
  activeOrderStrip: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: clientHomeVisual.fabBorder,
    backgroundColor: 'rgba(12, 4, 8, 0.94)',
    shadowColor: clientHomeVisual.topBarGlow,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  activeOrderTextCol: { flex: 1, minWidth: 0 },
  activeOrderKicker: {
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 2.5,
    color: 'rgba(255,255,255,0.72)',
  },
  activeOrderStatus: {
    marginTop: 2,
    fontFamily: FONT.bold,
    fontSize: 15,
    letterSpacing: 0.3,
    color: WC.white,
  },
  ctaRow: { marginTop: spacing.lg, gap: spacing.sm },
  fab: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 20,
    borderRadius: radius.pill,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: WC.flyerCrimson,
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 2,
    borderColor: clientHomeVisual.fabBorder,
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  fabTxt: {
    fontFamily: FONT.bold,
    fontSize: 16,
    letterSpacing: 0.8,
    color: WC.white,
  },
});
