import type { TextStyle } from 'react-native';

import { FONT } from '@/constants/fonts';

/**
 * Palette « West Coast sunset » — crépuscule LA (golden hour), lowrider, néons adoucis.
 * Ambiance californienne ; le lieu reste défini dans `venue.ts` (Angers).
 */
export const WC = {
  brick: '#4a3542',
  brickDeep: '#1e161c',
  /** Accent sunset — hero, CTA (corail doux, pas rouge agressif) */
  fire: '#fb923c',
  fireDim: 'rgba(251, 146, 60, 0.38)',
  fireGlow: 'rgba(251, 146, 60, 0.12)',
  /** Carte / HUD — cyan ciel plus doux */
  neonCyan: '#5eead4',
  neonCyanDim: 'rgba(94, 234, 212, 0.32)',
  gold: '#fde68a',
  white: '#fff7ed',
  shadow: 'rgba(30, 18, 28, 0.45)',
  /** Ciel « golden hour » (rose pêche) */
  sunsetRose: '#fda4af',
  /** Horizon clair — pêche / corail */
  sunsetPeach: '#fdba74',
  /** Halo magenta crépuscule (accents doux) */
  sunsetMagenta: '#e879f9',
  /** Base nuit chaude (asphalte / fin de dégradé) */
  laNight: '#1a1418',
  laNightDeep: '#141018',
} as const;

/** Titre de section (uppercase) — corail sunset. */
export const wcSectionLabel: TextStyle = {
  fontFamily: FONT.bold,
  fontSize: 13,
  letterSpacing: 2,
  color: WC.fire,
  textTransform: 'uppercase',
  marginLeft: 2,
};
