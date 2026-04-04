/**
 * HUD GTA — cadre mini-carte, radar secours (`GTAHudFrame`, `GTAMiniMapFallbackInterior`).
 */
export const gtaHudFrameVisual = {
  borderGradient: ['rgba(34, 211, 238, 0.35)', 'rgba(250, 204, 21, 0.15)', 'rgba(34, 211, 238, 0.2)'] as const,
  scanLine: 'rgba(0, 0, 0, 0.55)',
  footerBarBg: 'rgba(0, 0, 0, 0.82)',
  footerBarBorderTop: 'rgba(34, 211, 238, 0.45)',
} as const;

export const gtaMapFallbackVisual = {
  gridLine: 'rgba(34, 211, 238, 0.15)',
  palmSilhouette: 'rgba(0, 0, 0, 0.25)',
  /** Contour « zone » façon minimap GTA (sans tuiles Google). */
  zoneBorder: 'rgba(34, 211, 238, 0.42)',
  zoneBorderDim: 'rgba(34, 211, 238, 0.14)',
  cornerBracket: 'rgba(250, 204, 21, 0.55)',
} as const;

/** Fenêtres néon du QG (`HuskoDepartureBuilding`). */
export const departureBuildingVisual = {
  windowFill: 'rgba(34, 211, 238, 0.55)',
} as const;
