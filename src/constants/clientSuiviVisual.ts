/**
 * Tokens visuels — écran suivi client (`app/client/suivi.tsx`).
 * Centralise rgba pour rester aligné theme / WC.
 */
export const clientSuiviVisual = {
  etaHeroBg: 'rgba(251, 146, 60, 0.22)',
  etaHeroBorder: 'rgba(253, 224, 71, 0.35)',
  etaHeroKicker: 'rgba(250, 250, 250, 0.75)',
  contactStripLbl: 'rgba(250, 250, 250, 0.45)',
  contactChipBg: 'rgba(0, 0, 0, 0.25)',
  cancelCardBorder: 'rgba(248, 113, 113, 0.45)',
  /** Cadre mini-carte suivi (Lowrider / néon) */
  mapNeonBorder: 'rgba(253, 224, 71, 0.42)',
  mapNeonBg: 'rgba(8, 4, 6, 0.55)',
  mapNeonShadow: 'rgba(255, 69, 0, 0.35)',
  /** Bandeau vérité synchro / GPS (lisible en prod, pas derrière un flag debug). */
  syncBannerBg: 'rgba(12, 6, 8, 0.92)',
  syncBannerBorder: 'rgba(252, 211, 77, 0.35)',
  syncErrorBorder: 'rgba(248, 113, 113, 0.5)',
  syncErrorBg: 'rgba(127, 29, 29, 0.22)',
  syncWarnBorder: 'rgba(251, 191, 36, 0.45)',
  syncWarnBg: 'rgba(120, 53, 15, 0.2)',
} as const;
