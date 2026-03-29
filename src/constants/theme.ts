/**
 * Design system Husko — fond profond, or / rouge, surfaces en couches (logique type apps livraison).
 */
export const colors = {
  bg: '#0a0404',
  bgLift: '#150808',
  /** Cartes et listes */
  card: '#1a0a0a',
  cardElevated: '#261010',
  /** Bordures */
  border: '#5c2020',
  borderSubtle: 'rgba(92, 32, 32, 0.45)',
  borderGlow: 'rgba(240, 208, 80, 0.35)',
  /** Marque */
  accent: '#e02828',
  accentDeep: '#7a0e0e',
  accentDim: '#5c1010',
  text: '#faf8f6',
  textMuted: '#b8a8a8',
  gold: '#f2d45c',
  goldDim: '#c9a028',
  posterRed: '#d42828',
  /** Dock / overlays */
  mapOverlay: 'rgba(8, 2, 2, 0.94)',
  glass: 'rgba(18, 8, 8, 0.88)',
  brandGlow: 'rgba(240, 208, 80, 0.12)',
  /** Fond écran (LinearGradient) */
  gradient: ['#060204', '#140808', '#220e10', '#0c0404'] as const,
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
