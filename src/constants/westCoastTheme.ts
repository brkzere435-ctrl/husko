import type { TextStyle } from 'react-native';

/** Palette « West Coast » — brique, néon, nuit. */
export const WC = {
  brick: '#4c0a0a',
  brickDeep: '#2a0505',
  neonCyan: '#22d3ee',
  neonCyanDim: 'rgba(34, 211, 238, 0.35)',
  gold: '#fde68a',
  white: '#fafafa',
  shadow: 'rgba(0,0,0,0.55)',
} as const;

/** Titre de section aligné menu client (néon cyan, uppercase). */
export const wcSectionLabel: TextStyle = {
  fontSize: 13,
  fontWeight: '900',
  letterSpacing: 2,
  color: WC.neonCyan,
  textTransform: 'uppercase',
  marginLeft: 2,
};
