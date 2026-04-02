import type { TextStyle } from 'react-native';

/** Palette « West Coast » — brique sombre, feu, nuit (carte / HUD garde du cyan lisible). */
export const WC = {
  brick: '#3d0808',
  brickDeep: '#120303',
  /** Accent feu — titres, hero menu, CTA */
  fire: '#ff5a38',
  fireDim: 'rgba(255, 90, 56, 0.4)',
  fireGlow: 'rgba(255, 90, 56, 0.14)',
  /** Cartes, itinéraire, repères techniques */
  neonCyan: '#22d3ee',
  neonCyanDim: 'rgba(34, 211, 238, 0.35)',
  gold: '#fde68a',
  white: '#fafafa',
  shadow: 'rgba(0,0,0,0.6)',
} as const;

/** Titre de section (uppercase) — orange / rouge feu. */
export const wcSectionLabel: TextStyle = {
  fontSize: 13,
  fontWeight: '900',
  letterSpacing: 2,
  color: WC.fire,
  textTransform: 'uppercase',
  marginLeft: 2,
};
