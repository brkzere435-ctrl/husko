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
};

export const DECOR_PRESETS: Record<DecorPreset, DecorPresetConfig> = {
  hub: {
    baseGradient: ['#2a0505', '#3f0d12', '#0f172a', '#2a0505'],
    baseLocations: [0, 0.35, 0.72, 1],
    neonOverlay: ['transparent', 'rgba(34,211,238,0.07)', 'transparent'],
    neonOpacity: 0.9,
  },
  gerant: {
    baseGradient: ['#2a0505', '#3d2808', '#1a0c0c', '#2a0505'],
    baseLocations: [0, 0.38, 0.7, 1],
    neonOverlay: ['transparent', 'rgba(250,204,21,0.09)', 'transparent'],
    neonOpacity: 0.88,
  },
  client: {
    baseGradient: ['#2a0505', '#0f2418', '#0f172a', '#2a0505'],
    baseLocations: [0, 0.36, 0.72, 1],
    neonOverlay: ['transparent', 'rgba(74,222,128,0.07)', 'transparent'],
    neonOpacity: 0.88,
  },
  livreur: {
    baseGradient: ['#2a0505', '#0f1a2e', '#0c1220', '#2a0505'],
    baseLocations: [0, 0.35, 0.74, 1],
    neonOverlay: ['transparent', 'rgba(96,165,250,0.08)', 'transparent'],
    neonOpacity: 0.9,
  },
  assistant: {
    baseGradient: ['#2a0505', '#2a1438', '#0f172a', '#2a0505'],
    baseLocations: [0, 0.37, 0.71, 1],
    neonOverlay: ['transparent', 'rgba(232,121,249,0.08)', 'transparent'],
    neonOpacity: 0.88,
  },
};
