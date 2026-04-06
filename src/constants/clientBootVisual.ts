/**
 * Overlay boot client — `ClientBootOverlay` (dégradés + teintes texte).
 * Teinte flyer rouge / noir (cohérent avec `DECOR_PRESETS.client`).
 */
export const clientBootVisual = {
  overlayGradient: ['rgba(40, 6, 8, 0.45)', 'rgba(120, 14, 18, 0.42)', 'rgba(8, 2, 4, 0.88)'] as const,
  vignetteGradient: ['transparent', 'rgba(60, 10, 12, 0.28)', 'rgba(12, 4, 6, 0.62)'] as const,
  /** Voile sur la photo hero — même famille que l’accueil client. */
  tintGradient: ['rgba(25, 4, 6, 0.52)', 'rgba(95, 12, 16, 0.42)', 'rgba(15, 4, 6, 0.8)', '#0a0404'] as const,
  script: 'rgba(254, 243, 199, 0.92)',
  skipHint: 'rgba(255, 247, 237, 0.55)',
} as const;
