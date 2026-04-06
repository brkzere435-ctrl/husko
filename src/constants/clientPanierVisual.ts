/**
 * Tokens visuels — panier client (`app/client/panier.tsx`).
 * Aligné sur le même « flyer » rouge / or que `clientMenuVisual`.
 */
export const clientPanierVisual = {
  /** Bandeau horaires / service fermé. */
  outsideBannerBg: 'rgba(127, 29, 29, 0.22)',
  outsideBannerBorder: 'rgba(248, 113, 113, 0.4)',
  /** Bandeau synchro cloud / Firebase. */
  cloudBannerBg: 'rgba(252, 211, 77, 0.08)',
  cloudBannerBorder: 'rgba(252, 211, 77, 0.4)',
  /** Bandeau mode test (créneau horaire ignoré). */
  testHoursBannerBg: 'rgba(192, 132, 252, 0.1)',
  testHoursBannerBorder: 'rgba(192, 132, 252, 0.42)',
  /** Dégradé ligne « Total ». */
  totalGradientColors: [
    'rgba(60, 10, 12, 0.96)',
    'rgba(20, 6, 8, 0.98)',
    'rgba(12, 4, 6, 0.94)',
  ] as const,
  totalGradientLocations: [0, 0.55, 1] as const,
  totalRowBorder: 'rgba(252, 211, 77, 0.28)',
} as const;
