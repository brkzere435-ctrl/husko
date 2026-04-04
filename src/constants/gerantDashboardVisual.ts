/**
 * Tokens visuels — écrans gérant (`app/gerant/index.tsx`, `app/gerant/reglages.tsx`, …).
 * Bordures néon : `WC.neonCyanDim` / `WC.neonCyan` (inchangées ici).
 */
export const gerantDashboardVisual = {
  /** Carte déverrouillage PIN (fond plus opaque que les panneaux liste). */
  lockCardBg: 'rgba(0, 0, 0, 0.45)',
  /** Bannière mode autonome + bloc « applications liées ». */
  panelBg: 'rgba(0, 0, 0, 0.35)',
  /** Réglages — tuiles raccourcis. */
  reglagesShortcutBg: 'rgba(0, 0, 0, 0.25)',
  /** Réglages — ligne preset autonome sélectionné. */
  reglagesPresetSelectedBg: 'rgba(0, 0, 0, 0.4)',
} as const;
