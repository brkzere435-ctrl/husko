/**
 * Overlay boot client — `ClientBootOverlay` (dégradés + teintes texte).
 */
export const clientBootVisual = {
  overlayGradient: ['rgba(60, 40, 72, 0.35)', 'rgba(180, 90, 70, 0.4)', 'rgba(24, 18, 22, 0.82)'] as const,
  vignetteGradient: ['transparent', 'rgba(40, 28, 38, 0.25)', 'rgba(24, 18, 24, 0.55)'] as const,
  script: 'rgba(254, 243, 199, 0.92)',
  skipHint: 'rgba(255, 247, 237, 0.55)',
} as const;
