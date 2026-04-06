/**
 * Tokens visuels — écran client menu (`app/client/(tabs)/menu.tsx`) + accueil (`(tabs)/index.tsx`).
 * Centralise dégradés et rgba pour rester aligné WC + theme (évite hex épars).
 */
import type { MenuCategory } from '@/constants/menu';
import { WC } from '@/constants/westCoastTheme';
import { colors } from '@/constants/theme';

/** Bloc hero menu — flyer carmine / noir (affiches Husko By Night). */
export const clientMenuHero = {
  gradientColors: ['rgba(6, 2, 4, 0.98)', 'rgba(50, 6, 10, 0.96)', 'rgba(110, 12, 14, 0.94)'] as const,
  gradientLocations: [0, 0.42, 1] as const,
  cardBorder: 'rgba(220, 38, 38, 0.45)',
  innerGlowBorder: 'rgba(255, 255, 255, 0.08)',
  wcBrandTextShadow: 'rgba(0,0,0,0.85)',
  /** Pastille statut commande (vert = ouvert, rouge = fermé) */
  statusOpenBg: 'rgba(34, 197, 94, 0.18)',
  statusOpenBorder: 'rgba(34, 197, 94, 0.5)',
  statusClosedBg: 'rgba(248, 113, 113, 0.14)',
  statusClosedBorder: 'rgba(248, 113, 113, 0.45)',
  statusDotOn: WC.statusOpenNeon,
  statusDotOff: WC.statusClosedNeon,
  sureHourBannerBg: 'rgba(127, 29, 29, 0.35)',
  textMuted: 'rgba(255, 255, 255, 0.7)',
  textMutedStrong: 'rgba(255, 255, 255, 0.82)',
  descMuted: 'rgba(255, 255, 255, 0.62)',
  /** Cibles tactiles téléphone / Snap sur le hero (accessibilité store-ready). */
  heroContactBorder: 'rgba(252, 211, 77, 0.4)',
  heroContactBg: 'rgba(12, 4, 6, 0.55)',
} as const;

/** Barre titre + séparateur sous le statut système. */
export const clientMenuChrome = {
  borderBottom: 'rgba(185, 28, 28, 0.45)',
  background: 'rgba(6, 2, 4, 0.92)',
} as const;

/** Bouton panier header + pastille quantité. */
export const clientMenuCart = {
  btnBorder: 'rgba(255, 234, 0, 0.45)',
  btnBg: 'rgba(20, 14, 22, 0.75)',
  badgeBg: WC.neonOrange,
  badgeBorder: 'rgba(255, 234, 0, 0.9)',
} as const;

/** Chips de filtre catégorie. */
export const clientMenuChips = {
  onBg: 'rgba(185, 28, 28, 0.95)',
  onBorder: 'rgba(252, 211, 77, 0.75)',
  offBg: 'rgba(18, 6, 8, 0.88)',
  offBorder: 'rgba(220, 38, 38, 0.35)',
  txt: 'rgba(255, 255, 255, 0.9)',
  txtOn: '#140808',
} as const;

/** Rangée produit (FlashList). */
export const clientMenuRow = {
  background: 'rgba(12, 4, 6, 0.92)',
  border: 'rgba(185, 28, 28, 0.4)',
  shadowColor: WC.flyerCrimson,
  shadowOpacity: 0.35,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 4 } as const,
  pricePillBg: 'rgba(127, 29, 29, 0.92)',
  pricePillBorder: 'rgba(252, 211, 77, 0.5)',
} as const;

/** Feedback tactile — rangées produit (Android ripple). */
export const clientMenuInteractions = {
  rowAndroidRipple: 'rgba(220, 38, 38, 0.18)',
} as const;

/** Cadres photo liste / fiche (`MenuItemVisual`). */
export const clientMenuItemFrame = {
  wrapBorder: 'rgba(220, 38, 38, 0.45)',
  wrapThumbBorder: 'rgba(252, 211, 77, 0.2)',
  wrapHeroBorder: 'rgba(185, 28, 28, 0.4)',
  photoLoadingBg: 'rgba(12, 4, 4, 0.5)',
  neonHeroBorder: 'rgba(252, 211, 77, 0.22)',
} as const;

/** Dock bas (résumé panier + CTA). */
export const clientMenuDock = {
  hairlineColors: [
    'rgba(185, 28, 28, 0.9)',
    'rgba(252, 211, 77, 0.65)',
    'rgba(127, 29, 29, 0.5)',
  ] as const,
  barBg: 'rgba(4, 2, 3, 0.97)',
} as const;

/** Écran Accueil client — hero + FAB (aligné flyers rouge / or). */
export const clientHomeVisual = {
  topBarGlow: WC.flyerCrimson,
  heroTitleShadow: 'rgba(0,0,0,0.9)',
  /** Carte hero (LinearGradient) — carbone → carmin. */
  heroCardGradient: ['rgba(8,2,4,0.97)', 'rgba(55,8,12,0.95)', 'rgba(120,14,16,0.93)'] as const,
  heroCardBorder: 'rgba(220, 38, 38, 0.42)',
  /** Pastille ouvert / fermé — vert vs rouge (témoin lisible). */
  statusPillOpenBg: 'rgba(34, 197, 94, 0.2)',
  statusPillOpenBorder: 'rgba(34, 197, 94, 0.55)',
  statusPillClosedBg: 'rgba(248, 113, 113, 0.16)',
  statusPillClosedBorder: 'rgba(248, 113, 113, 0.48)',
  fabGradient: [WC.flyerCrimsonDeep, WC.flyerCrimson] as const,
  fabBorder: 'rgba(252, 211, 77, 0.85)',
} as const;

/** Repli sans photo — triplets de dégradés (`MenuItemVisual`), stops depuis `colors`. */
export const menuCategoryGradientTriples = {
  smash: [WC.flyerCrimsonDeep, '#3f0a0a', colors.bg],
  frites: ['#7c2d12', WC.flyerCrimsonDeep, colors.bg],
  baguette: ['#713f12', '#451a03', colors.bg],
  sandwich: [WC.flyerCrimson, '#134e4a', colors.bg],
  four: [colors.menuCatFourRust, WC.flyerCrimsonDeep, colors.bg],
  dessert: ['#4c0519', WC.flyerCrimsonDeep, colors.bg],
  boisson: [colors.menuCatBoisson1, colors.menuCatBoisson2, colors.menuCatBoisson3],
} as const satisfies Record<MenuCategory, readonly [string, string, string]>;
