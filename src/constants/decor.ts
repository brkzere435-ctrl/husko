import type { AppVariant } from '@/constants/appVariant';

/** Presets de fond néon par espace (APK mono-rôle ou hub). */
export type DecorPreset = 'hub' | 'gerant' | 'client' | 'livreur' | 'assistant';

export function resolveDecorPreset(role: AppVariant): DecorPreset {
  if (role === 'all') return 'hub';
  return role;
}

export type DecorPresetConfig = {
  /** Gradient principal (4 stops, ciel crépusculaire → horizon corail → base chaude). */
  baseGradient: readonly [string, string, string, string];
  baseLocations: readonly [number, number, number, number];
  /** Voile néon diagonal (3 stops). */
  neonOverlay: readonly [string, string, string];
  neonOpacity: number;
  /** Halos bokeh (client / hub). */
  ambientOrbs?: boolean;
};

export const DECOR_PRESETS: Record<DecorPreset, DecorPresetConfig> = {
  hub: {
    baseGradient: ['#3d2f4a', '#7c4e6e', '#d97757', '#1e1619'],
    baseLocations: [0, 0.3, 0.62, 1],
    neonOverlay: ['transparent', 'rgba(251,146,60,0.09)', 'rgba(167,139,250,0.08)'],
    neonOpacity: 0.9,
    ambientOrbs: true,
  },
  gerant: {
    baseGradient: ['#2e2435', '#5c3d52', '#b4533a', '#1c1418'],
    baseLocations: [0, 0.36, 0.7, 1],
    neonOverlay: ['transparent', 'rgba(251,146,60,0.07)', 'rgba(253,224,71,0.06)'],
    neonOpacity: 0.88,
  },
  client: {
    baseGradient: ['#4a3560', '#8b5a6e', '#e8956a', '#221820'],
    baseLocations: [0, 0.32, 0.64, 1],
    neonOverlay: ['rgba(251,146,60,0.06)', 'rgba(252,211,77,0.1)', 'rgba(196,181,253,0.06)'],
    neonOpacity: 0.88,
    ambientOrbs: true,
  },
  livreur: {
    baseGradient: ['#2a3048', '#4a5a78', '#f0ab7c', '#18141c'],
    baseLocations: [0, 0.34, 0.68, 1],
    neonOverlay: ['transparent', 'rgba(251,146,60,0.07)', 'rgba(125,211,252,0.08)'],
    neonOpacity: 0.86,
  },
  assistant: {
    baseGradient: ['#352848', '#6b4a6e', '#fbbf77', '#1a1418'],
    baseLocations: [0, 0.37, 0.68, 1],
    neonOverlay: ['transparent', 'rgba(232,121,249,0.06)', 'rgba(251,146,60,0.05)'],
    neonOpacity: 0.85,
  },
};
