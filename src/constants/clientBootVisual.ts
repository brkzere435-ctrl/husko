/**
 * Overlay boot client — `ClientBootOverlay` (dégradés + teintes texte).
 */
export const clientBootVisual = {
  overlayGradient: ['rgba(90, 70, 110, 0.32)', 'rgba(210, 120, 95, 0.38)', 'rgba(22, 18, 22, 0.84)'] as const,
  vignetteGradient: ['transparent', 'rgba(55, 40, 50, 0.22)', 'rgba(24, 18, 24, 0.55)'] as const,
  script: 'rgba(254, 243, 199, 0.92)',
  skipHint: 'rgba(255, 247, 237, 0.55)',
} as const;
