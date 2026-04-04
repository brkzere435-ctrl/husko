/**
 * Bandeaux et pastilles « infra » — déploiement, réseau, diagnostic synchro.
 */
export const deploymentHintsVisual = {
  hintDev: 'rgba(160, 160, 200, 0.85)',
  alertFirebaseBg: 'rgba(60, 15, 15, 0.92)',
  alertFirebaseBorder: 'rgba(248, 113, 113, 0.95)',
  alertMapsBorder: 'rgba(34, 211, 238, 0.55)',
} as const;

export const networkOfflineVisual = {
  barBg: 'rgba(80, 25, 25, 0.95)',
  barBorderBottom: 'rgba(248, 113, 113, 0.45)',
  bodyText: 'rgba(254, 243, 199, 0.92)',
} as const;

export const syncDiagnosticsToneVisual = {
  ok: 'rgba(120, 220, 160, 0.95)',
  err: 'rgba(255, 160, 160, 0.95)',
} as const;
