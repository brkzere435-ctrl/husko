import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { getAppVariant } from '@/constants/appVariant';
import { DECOR_PRESETS, type DecorPreset, resolveDecorPreset } from '@/constants/decor';
import { WC } from '@/constants/westCoastTheme';

import { HuskoAmbientGlow } from './HuskoAmbientGlow';

const CARBON_MESH = require('../../../assets/textures/carbon-mesh.png');

type Props = ViewProps & {
  children: React.ReactNode;
  /** Si omis : déduit de la variante d’app (APK mono-rôle ou hub). */
  preset?: DecorPreset;
};

export function WestCoastBackground({ children, style, preset: presetProp, ...rest }: Props) {
  const role = getAppVariant();
  const preset = presetProp ?? resolveDecorPreset(role);
  const cfg = DECOR_PRESETS[preset] ?? DECOR_PRESETS.hub;

  return (
    <View style={[styles.root, style]} {...rest}>
      <LinearGradient
        colors={[...cfg.baseGradient]}
        locations={[...cfg.baseLocations]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[...cfg.neonOverlay]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { opacity: cfg.neonOpacity }]}
      />
      {cfg.carbonMeshOpacity != null && cfg.carbonMeshOpacity > 0 ? (
        <Image
          source={CARBON_MESH}
          style={[StyleSheet.absoluteFill, { opacity: cfg.carbonMeshOpacity }]}
          contentFit="cover"
          pointerEvents="none"
          accessibilityIgnoresInvertColors
        />
      ) : null}
      {cfg.ambientOrbs ? <HuskoAmbientGlow /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WC.brickDeep,
  },
});
