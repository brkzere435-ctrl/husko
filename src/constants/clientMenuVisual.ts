/**
 * Tokens visuels — écran client « À la carte » (`app/client/index.tsx`).
 * Centralise dégradés et rgba pour rester aligné WC + theme (évite hex épars).
 */
import { WC } from '@/constants/westCoastTheme';
import { colors } from '@/constants/theme';

/** Bloc hero — dégradé crépuscule prune / corail (sunset West Coast). */
export const clientMenuHero = {
  gradientColors: ['rgba(45, 32, 58, 0.95)', 'rgba(120, 72, 88, 0.9)', 'rgba(40, 52, 72, 0.92)'] as const,
  gradientLocations: [0, 0.48, 1] as const,
  cardBorder: 'rgba(251, 146, 60, 0.42)',
  innerGlowBorder: 'rgba(253, 224, 71, 0.14)',
  wcBrandTextShadow: WC.shadow,
  statusClosedBg: 'rgba(180, 83, 9, 0.28)',
  statusClosedBorder: 'rgba(251, 191, 36, 0.35)',
  statusDotOff: '#fcd34d',
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
  offBg: 'rgba(124, 58, 237, 0.28)',
  offBorder: 'rgba(251, 146, 60, 0.35)',
  txt: 'rgba(255, 247, 237, 0.92)',
  txtOn: '#292524',
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

/** Dock bas (résumé panier + CTA). */
export const clientMenuDock = {
  hairlineColors: [
    'rgba(251, 146, 60, 0.85)',
    'rgba(253, 224, 71, 0.7)',
    'rgba(167, 139, 250, 0.45)',
  ] as const,
  barBg: 'rgba(22, 18, 26, 0.96)',
} as const;
