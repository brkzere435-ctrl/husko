/**
 * Design system Husko — dark mode marqué, brique / noir profond, accents feu (affiche lowrider).
 */
export const colors = {
  bg: '#020101',
  bgLift: '#0c0404',
  /** Cartes et listes */
  card: '#140606',
  cardElevated: '#1c0a0a',
  /** Bordures */
  border: '#4a1818',
  borderSubtle: 'rgba(74, 24, 24, 0.5)',
  borderGlow: 'rgba(255, 120, 72, 0.38)',
  /** Marque — rouge / orange feu */
  accent: '#ff4d2a',
  accentMid: '#e02818',
  accentDeep: '#5c0a06',
  accentDim: '#3d0808',
  text: '#faf8f6',
  textMuted: '#b0a0a0',
  gold: '#f2d45c',
  goldDim: '#c9a028',
  posterRed: '#d42828',
  /** Dock / overlays */
  mapOverlay: 'rgba(4, 1, 1, 0.94)',
  glass: 'rgba(12, 4, 4, 0.9)',
  brandGlow: 'rgba(255, 90, 56, 0.14)',
  /** Fond écran (LinearGradient) */
  gradient: ['#010000', '#100505', '#1a0806', '#040101'] as const,
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
    backgroundColor: 'rgba(0,0,0,0.52)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 56, 0.3)',
    ...elevation.card,
  },
  neonPanelStrong: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 90, 56, 0.42)',
    ...elevation.card,
  },
} as const;
