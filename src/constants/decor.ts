import type { AppVariant } from '@/constants/appVariant';

/** Presets de fond néon par espace (APK mono-rôle ou hub). */
export type DecorPreset = 'hub' | 'gerant' | 'client' | 'livreur' | 'assistant';

export function resolveDecorPreset(role: AppVariant): DecorPreset {
  if (role === 'all') return 'hub';
  return role;
}

export type DecorPresetConfig = {
  /** Gradient principal (4 stops, coin brick → nuit). */
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
    baseGradient: ['#0a0203', '#2a080f', '#081218', '#0c0305'],
    baseLocations: [0, 0.32, 0.68, 1],
    neonOverlay: ['transparent', 'rgba(255,90,56,0.08)', 'rgba(34,211,238,0.06)'],
    neonOpacity: 0.94,
    ambientOrbs: true,
  },
  gerant: {
    baseGradient: ['#140303', '#2a1008', '#120808', '#140303'],
    baseLocations: [0, 0.38, 0.7, 1],
    neonOverlay: ['transparent', 'rgba(255,90,56,0.07)', 'rgba(250,204,21,0.06)'],
    neonOpacity: 0.9,
  },
  client: {
    baseGradient: ['#080102', '#3a0a12', '#061018', '#0a0304'],
    baseLocations: [0, 0.34, 0.7, 1],
    neonOverlay: ['rgba(255,75,45,0.06)', 'rgba(255,90,56,0.1)', 'rgba(253,230,138,0.04)'],
    neonOpacity: 0.95,
    ambientOrbs: true,
  },
  livreur: {
    baseGradient: ['#120303', '#0a1520', '#060c14', '#120303'],
    baseLocations: [0, 0.35, 0.74, 1],
    neonOverlay: ['transparent', 'rgba(255,90,56,0.07)', 'rgba(96,165,250,0.06)'],
    neonOpacity: 0.92,
  },
  assistant: {
    baseGradient: ['#120303', '#1e0f28', '#0a121c', '#120303'],
    baseLocations: [0, 0.37, 0.71, 1],
    neonOverlay: ['transparent', 'rgba(232,121,249,0.07)', 'rgba(255,90,56,0.05)'],
    neonOpacity: 0.88,
  },
};
