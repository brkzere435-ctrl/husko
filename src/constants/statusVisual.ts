/**
 * Pastilles d’état — `StatusBadge`, `SyncStatusPill`.
 */
import { appScreenVisual } from '@/constants/appScreenVisual';

/** Fonds semi-transparents par statut commande (`StatusBadge`). Bordures / texte : `theme.colors`. */
export const statusBadgeBackground = {
  pending: 'rgba(240, 208, 80, 0.12)',
  preparing: 'rgba(200, 120, 40, 0.2)',
  awaiting_livreur: 'rgba(80, 140, 220, 0.2)',
  on_way: 'rgba(212, 40, 40, 0.22)',
  delivered: 'rgba(80, 80, 90, 0.35)',
  cancelled: 'rgba(40, 40, 40, 0.5)',
  fallback: 'rgba(255, 255, 255, 0.06)',
} as const;

export const syncStatusPillVisual = {
  cloudBorder: 'rgba(80, 200, 120, 0.5)',
  cloudBg: 'rgba(20, 60, 40, 0.35)',
  errBorder: 'rgba(255, 100, 100, 0.65)',
  errBg: 'rgba(80, 20, 20, 0.45)',
  localBg: appScreenVisual.overlay025,
} as const;
