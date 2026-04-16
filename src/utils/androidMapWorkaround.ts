import { Platform } from 'react-native';

type AndroidConstants = {
  Manufacturer?: string;
  Brand?: string;
};

/**
 * Certains fabricants (Huawei / Honor sans GMS complet, etc.) affichent react-native-maps
 * avec un viewport noir ou des tuiles qui ne se chargent pas — le radar OSM + couche GTA reste fiable.
 * Surcharge terrain : EXPO_PUBLIC_HUSKO_FORCE_RADAR_MAP=1
 */
export function shouldPreferMiniMapFallback(): boolean {
  if (process.env.EXPO_PUBLIC_HUSKO_FORCE_RADAR_MAP === '1') return true;
  if (Platform.OS !== 'android') return false;
  const c = Platform.constants as AndroidConstants | undefined;
  const raw = `${c?.Manufacturer ?? ''} ${c?.Brand ?? ''}`.toLowerCase();
  if (!raw.trim()) return false;
  return raw.includes('huawei') || raw.includes('honor');
}
