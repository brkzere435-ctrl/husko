/**
 * Tokens visuels — écrans gérant (`app/gerant/index.tsx`, `app/gerant/reglages.tsx`, …).
 * Bordures néon : `WC.neonCyanDim` / `WC.neonCyan` (inchangées ici).
 */
import { appScreenVisual } from '@/constants/appScreenVisual';

export const gerantDashboardVisual = {
  /** Carte déverrouillage PIN (fond plus opaque que les panneaux liste). */
  lockCardBg: appScreenVisual.overlay045,
  /** Bannière mode autonome + bloc « applications liées ». */
  panelBg: appScreenVisual.overlay035,
  /** Réglages — tuiles raccourcis. */
  reglagesShortcutBg: appScreenVisual.overlay025,
  /** Réglages — ligne preset autonome sélectionné. */
  reglagesPresetSelectedBg: appScreenVisual.overlay040,
} as const;
