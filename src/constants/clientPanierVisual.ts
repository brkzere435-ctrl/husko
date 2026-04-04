/**
 * Tokens visuels — panier client (`app/client/panier.tsx`).
 */
export const clientPanierVisual = {
  /** Bandeau livraison hors zone (accent néon cyan). */
  outsideBannerBg: 'rgba(94, 234, 212, 0.1)',
  outsideBannerBorder: 'rgba(94, 234, 212, 0.38)',
  /** Bandeau synchro cloud / Firebase. */
  cloudBannerBg: 'rgba(250, 204, 21, 0.08)',
  cloudBannerBorder: 'rgba(250, 204, 21, 0.45)',
  /** Dégradé ligne « Total » (aligné sunset menu / theme). */
  totalGradientColors: [
    'rgba(45, 31, 53, 0.96)',
    'rgba(30, 22, 28, 0.98)',
    'rgba(30, 24, 32, 0.94)',
  ] as const,
  totalGradientLocations: [0, 0.55, 1] as const,
  totalRowBorder: 'rgba(253, 230, 138, 0.22)',
} as const;
