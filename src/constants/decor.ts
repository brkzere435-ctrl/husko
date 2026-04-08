import type { AppVariant } from '@/constants/appVariant';
import { decorNeonVisual } from '@/constants/decorNeonVisual';
import { WC } from '@/constants/westCoastTheme';

/** Presets de fond néon par espace (APK mono-rôle ou hub). */
export type DecorPreset = 'hub' | 'gerant' | 'client' | 'livreur' | 'assistant';

export function resolveDecorPreset(role: AppVariant): DecorPreset {
  if (role === 'all') return 'gerant';
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
  /**
   * Texture PNG « mesh carbone » plein écran (`assets/textures/carbon-mesh.png`), opacité faible.
   * Omis ou 0 = pas d’overlay (économise un calque sur les autres rôles).
   */
  carbonMeshOpacity?: number;
};

export const DECOR_PRESETS: Record<DecorPreset, DecorPresetConfig> = {
  hub: {
    baseGradient: [WC.flyerCrimsonDeep, WC.flyerCrimson, '#5a0f13', WC.flyerBlack],
    baseLocations: [0, 0.34, 0.68, 1],
    neonOverlay: [...decorNeonVisual.hub],
    neonOpacity: 0.72,
    ambientOrbs: true,
    carbonMeshOpacity: 0.08,
  },
  gerant: {
    baseGradient: [WC.flyerCrimsonDeep, '#991b1b', '#5d1215', WC.flyerBlack],
    baseLocations: [0, 0.33, 0.66, 1],
    neonOverlay: [...decorNeonVisual.gerant],
    neonOpacity: 0.7,
    carbonMeshOpacity: 0.09,
  },
  client: {
    /** Fond client revu : brique rouge premium alignée au splash. */
    baseGradient: ['#7f1d1d', '#b91c1c', '#641317', WC.flyerBlack],
    baseLocations: [0, 0.3, 0.63, 1],
    neonOverlay: [...decorNeonVisual.client],
    neonOpacity: 0.7,
    /** Halos sunset retirés : rendu flyer rouge/noir plus propre. */
    ambientOrbs: false,
    carbonMeshOpacity: 0.1,
  },
  livreur: {
    baseGradient: [WC.flyerCrimsonDeep, '#8f1a1f', '#4f1016', WC.flyerBlack],
    baseLocations: [0, 0.34, 0.65, 1],
    neonOverlay: [...decorNeonVisual.livreur],
    neonOpacity: 0.68,
    carbonMeshOpacity: 0.09,
  },
  assistant: {
    baseGradient: ['#483560', '#7a5a78', WC.sunsetRose, WC.laNight],
    baseLocations: [0, 0.35, 0.62, 1],
    neonOverlay: [...decorNeonVisual.assistant],
    neonOpacity: 0.85,
  },
};
