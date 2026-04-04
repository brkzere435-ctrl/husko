import type { AppVariant } from '@/constants/appVariant';
import { decorNeonVisual } from '@/constants/decorNeonVisual';
import { WC } from '@/constants/westCoastTheme';

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
    baseGradient: ['#5d4a6e', '#9d7088', WC.sunsetPeach, WC.laNight],
    baseLocations: [0, 0.28, 0.58, 1],
    neonOverlay: [...decorNeonVisual.hub],
    neonOpacity: 0.9,
    ambientOrbs: true,
  },
  gerant: {
    baseGradient: ['#3d3048', '#7a5568', WC.fire, WC.laNightDeep],
    baseLocations: [0, 0.34, 0.66, 1],
    neonOverlay: [...decorNeonVisual.gerant],
    neonOpacity: 0.88,
  },
  client: {
    baseGradient: ['#6b5a82', '#a87880', WC.sunsetPeach, WC.laNight],
    baseLocations: [0, 0.3, 0.58, 1],
    neonOverlay: [...decorNeonVisual.client],
    neonOpacity: 0.88,
    ambientOrbs: true,
  },
  livreur: {
    baseGradient: ['#354060', '#5c6a8a', WC.sunsetPeach, WC.laNightDeep],
    baseLocations: [0, 0.32, 0.62, 1],
    neonOverlay: [...decorNeonVisual.livreur],
    neonOpacity: 0.86,
  },
  assistant: {
    baseGradient: ['#483560', '#7a5a78', WC.sunsetRose, WC.laNight],
    baseLocations: [0, 0.35, 0.62, 1],
    neonOverlay: [...decorNeonVisual.assistant],
    neonOpacity: 0.85,
  },
};
