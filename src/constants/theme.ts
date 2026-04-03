/**
 * Design system Husko — ambiance coucher de soleil West Coast / GTA dusk :
 * tons chauds adoucis (prune, corail, pêche), pas de rouge sang ni noir pur.
 */
export const colors = {
  bg: '#1a1418',
  bgLift: '#261e24',
  /** Cartes et listes */
  card: '#2e262e',
  cardElevated: '#3a3238',
  /** Bordures */
  border: 'rgba(251, 191, 176, 0.28)',
  borderSubtle: 'rgba(244, 200, 180, 0.2)',
  borderGlow: 'rgba(251, 146, 60, 0.42)',
  /** Marque — corail / orange sunset */
  accent: '#fb923c',
  accentMid: '#ea580c',
  accentDeep: '#c2410c',
  accentDim: '#5c2d24',
  text: '#fff7ed',
  textMuted: '#d4c4c8',
  gold: '#fcd34d',
  goldDim: '#d97706',
  posterRed: '#e85d4a',
  /** Dock / overlays */
  mapOverlay: 'rgba(22, 16, 22, 0.92)',
  glass: 'rgba(38, 30, 38, 0.88)',
  brandGlow: 'rgba(251, 146, 60, 0.12)',
  /** Fond écran (LinearGradient) — crépuscule prune → corail doux */
  gradient: ['#2d1f35', '#4a3042', '#5c3d4a', '#1e1619'] as const,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 22,
  pill: 999,
};

/** Profondeur — dock flottant, cartes produit */
export const elevation = {
  dock: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 22,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  hero: {
    shadowColor: '#f0d050',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};

/**
 * Surfaces premium réutilisables — bordure subtile + rayon xl + ombre légère.
 * Composer avec padding / margin en local : style={[surface.elevated, styles.inner]}
 */
export const surface = {
  elevated: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...elevation.card,
  },
  glass: {
    backgroundColor: colors.glass,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    ...elevation.card,
  },
  inset: {
    backgroundColor: colors.bgLift,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  /** Cartes / blocs néon (hub, menu, distribution) — bordure feu légère + ombre. */
  neonPanel: {
    backgroundColor: 'rgba(28, 22, 30, 0.72)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.28)',
    ...elevation.card,
  },
  neonPanelStrong: {
    backgroundColor: 'rgba(30, 24, 32, 0.78)',
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: 'rgba(251, 146, 60, 0.38)',
    ...elevation.card,
  },
} as const;
