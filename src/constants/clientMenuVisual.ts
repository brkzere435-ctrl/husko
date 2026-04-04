/**
 * Tokens visuels — écran client « À la carte » (`app/client/index.tsx`).
 * Centralise dégradés et rgba pour rester aligné WC + theme (évite hex épars).
 */
import type { MenuCategory } from '@/constants/menu';
import { WC } from '@/constants/westCoastTheme';
import { colors } from '@/constants/theme';

/** Bloc hero — dégradé crépuscule LA (rose / pêche / nuit chaude). */
export const clientMenuHero = {
  gradientColors: ['rgba(107, 90, 130, 0.96)', 'rgba(180, 120, 110, 0.92)', 'rgba(253, 186, 116, 0.88)'] as const,
  gradientLocations: [0, 0.48, 1] as const,
  cardBorder: 'rgba(251, 146, 60, 0.42)',
  innerGlowBorder: 'rgba(253, 224, 71, 0.14)',
  wcBrandTextShadow: WC.shadow,
  statusClosedBg: 'rgba(180, 83, 9, 0.28)',
  statusClosedBorder: 'rgba(251, 191, 36, 0.35)',
  statusDotOff: colors.gold,
  sureHourBannerBg: 'rgba(251, 146, 60, 0.08)',
  textMuted: 'rgba(250, 250, 250, 0.65)',
  textMutedStrong: 'rgba(250, 250, 250, 0.75)',
  descMuted: 'rgba(250, 250, 250, 0.6)',
} as const;

/** Barre titre + séparateur sous le statut système. */
export const clientMenuChrome = {
  borderBottom: 'rgba(253, 224, 71, 0.18)',
  background: 'rgba(28, 22, 30, 0.78)',
} as const;

/** Bouton panier header + pastille quantité. */
export const clientMenuCart = {
  btnBorder: 'rgba(253, 224, 71, 0.38)',
  btnBg: 'rgba(28, 22, 30, 0.45)',
  badgeBg: colors.accentMid,
  badgeBorder: 'rgba(255, 255, 255, 0.85)',
} as const;

/** Chips de filtre catégorie. */
export const clientMenuChips = {
  onBg: 'rgba(255, 247, 237, 0.96)',
  onBorder: 'rgba(255, 247, 237, 0.96)',
  /** Hors sélection : brick sunset (plus de violet isolé — aligné WC.brick). */
  offBg: 'rgba(74, 53, 66, 0.55)',
  offBorder: 'rgba(251, 146, 60, 0.35)',
  txt: 'rgba(255, 247, 237, 0.92)',
  txtOn: colors.menuChipTxtOn,
} as const;

/** Rangée produit (FlashList). */
export const clientMenuRow = {
  background: 'rgba(36, 30, 38, 0.82)',
  border: WC.fireDim,
  shadowColor: WC.fire,
  shadowOpacity: 0.12,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 4 } as const,
  pricePillBg: 'rgba(194, 65, 12, 0.75)',
  pricePillBorder: 'rgba(253, 224, 71, 0.75)',
} as const;

/** Feedback tactile — rangées produit (Android ripple, aligné néon WC). */
export const clientMenuInteractions = {
  rowAndroidRipple: 'rgba(34, 211, 238, 0.15)',
} as const;

/** Cadres photo liste / fiche (`MenuItemVisual`). */
export const clientMenuItemFrame = {
  wrapBorder: 'rgba(34, 211, 238, 0.5)',
  wrapThumbBorder: 'rgba(253, 230, 138, 0.22)',
  wrapHeroBorder: 'rgba(34, 211, 238, 0.28)',
  photoLoadingBg: 'rgba(18, 4, 4, 0.22)',
  neonHeroBorder: 'rgba(34, 211, 238, 0.2)',
} as const;

/** Dock bas (résumé panier + CTA). */
export const clientMenuDock = {
  hairlineColors: [
    'rgba(251, 146, 60, 0.85)',
    'rgba(253, 224, 71, 0.7)',
    'rgba(94, 234, 212, 0.35)',
  ] as const,
  barBg: 'rgba(22, 18, 26, 0.96)',
} as const;

/** Repli sans photo — triplets de dégradés (`MenuItemVisual`), stops depuis `colors`. */
export const menuCategoryGradientTriples = {
  smash: [colors.accentDeep, WC.brick, colors.bg],
  frites: [colors.menuCatFritesDeep, colors.accentMid, colors.bg],
  baguette: [colors.menuCatBaguetteDeep, WC.brickDeep, colors.bg],
  sandwich: [colors.accentMid, colors.menuCatSandwichTeal, colors.bg],
  four: [colors.menuCatFourRust, colors.accentDeep, colors.bg],
  dessert: [WC.brick, colors.menuCatDessertWine, colors.bg],
  boisson: [colors.menuCatBoisson1, colors.menuCatBoisson2, colors.menuCatBoisson3],
} as const satisfies Record<MenuCategory, readonly [string, string, string]>;
