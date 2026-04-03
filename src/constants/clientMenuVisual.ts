/**
 * Tokens visuels — écran client « À la carte » (`app/client/index.tsx`).
 * Centralise dégradés et rgba pour rester aligné WC + theme (évite hex épars).
 */
import { WC } from '@/constants/westCoastTheme';
import { colors } from '@/constants/theme';

/** Bloc hero (carte néon sous le header de liste) — tons brique / nuit / cyan profond. */
export const clientMenuHero = {
  gradientColors: ['rgba(10, 3, 6, 0.97)', 'rgba(72, 12, 28, 0.92)', 'rgba(8, 32, 48, 0.95)'] as const,
  gradientLocations: [0, 0.48, 1] as const,
  /** Bordure carte hero — légèrement plus marquée que `WC.fireDim` pour le cadre néon. */
  cardBorder: 'rgba(255, 90, 56, 0.5)',
  innerGlowBorder: 'rgba(253, 230, 138, 0.12)',
  wcBrandTextShadow: WC.shadow,
  statusClosedBg: 'rgba(127, 29, 29, 0.35)',
  statusClosedBorder: 'rgba(248, 113, 113, 0.4)',
  statusDotOff: '#fca5a5',
  sureHourBannerBg: 'rgba(255, 90, 56, 0.08)',
  textMuted: 'rgba(250, 250, 250, 0.65)',
  textMutedStrong: 'rgba(250, 250, 250, 0.75)',
  descMuted: 'rgba(250, 250, 250, 0.6)',
} as const;

/** Barre titre + séparateur sous le statut système. */
export const clientMenuChrome = {
  borderBottom: 'rgba(253, 230, 138, 0.15)',
  background: 'rgba(6, 2, 5, 0.72)',
} as const;

/** Bouton panier header + pastille quantité. */
export const clientMenuCart = {
  btnBorder: 'rgba(253, 230, 138, 0.35)',
  btnBg: 'rgba(0, 0, 0, 0.35)',
  badgeBg: colors.accentMid,
  badgeBorder: 'rgba(255, 255, 255, 0.85)',
} as const;

/** Chips de filtre catégorie. */
export const clientMenuChips = {
  onBg: 'rgba(250, 250, 250, 0.96)',
  onBorder: 'rgba(250, 250, 250, 0.96)',
  offBg: 'rgba(127, 29, 29, 0.55)',
  offBorder: 'rgba(248, 113, 113, 0.45)',
  txt: 'rgba(250, 250, 250, 0.92)',
  txtOn: '#1c1917',
} as const;

/** Rangée produit (FlashList). */
export const clientMenuRow = {
  background: 'rgba(8, 4, 6, 0.72)',
  border: WC.fireDim,
  shadowColor: WC.fire,
  shadowOpacity: 0.14,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 4 } as const,
  pricePillBg: 'rgba(127, 29, 29, 0.92)',
  pricePillBorder: 'rgba(253, 230, 138, 0.85)',
} as const;

/** Dock bas (résumé panier + CTA). */
export const clientMenuDock = {
  hairlineColors: [
    'rgba(255, 90, 56, 0.95)',
    'rgba(253, 230, 138, 0.65)',
    'rgba(220, 40, 40, 0.55)',
  ] as const,
  barBg: 'rgba(6, 2, 4, 0.97)',
} as const;
