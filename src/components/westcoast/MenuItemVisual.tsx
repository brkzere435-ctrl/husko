import type { ComponentProps } from 'react';
import { memo, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import type { MenuCategory, MenuItem } from '@/constants/menu';
import { clientMenuItemFrame, menuCategoryGradientTriples } from '@/constants/clientMenuVisual';
import { getMenuImage } from '@/constants/menuImages';
import { colors, radius, spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';

const CAT_ICON: Record<MenuCategory, ComponentProps<typeof Ionicons>['name']> = {
  smash: 'flame',
  frites: 'fast-food',
  baguette: 'restaurant',
  sandwich: 'nutrition',
  four: 'bonfire',
  dessert: 'ice-cream',
  boisson: 'water',
};

type Props = {
  item: MenuItem;
  size: 'sm' | 'lg';
  /** Fiche produit : cadre plus discret pour éviter double bordure avec la carte. */
  emphasizeFrame?: boolean;
};

function MenuItemVisualInner({ item, size, emphasizeFrame = true }: Props) {
  const side = size === 'lg' ? 220 : 72;
  const iconSz = size === 'lg' ? 88 : 32;
  const g = menuCategoryGradientTriples[item.category];
  const icon = CAT_ICON[item.category];
  const photo = getMenuImage(item);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageFailed(false);
    setImageLoaded(false);
  }, [item.id]);

  const frameSoft = size === 'lg' && emphasizeFrame === false;

  if (photo && !imageFailed) {
    const placeholderBg = menuCategoryGradientTriples[item.category][0];
    const thumb = size === 'sm';
    return (
      <View
        style={[
          styles.wrap,
          thumb && styles.wrapThumb,
          frameSoft && styles.wrapHero,
          { width: side, height: side, backgroundColor: placeholderBg },
        ]}
      >
        <Image
          source={photo}
          recyclingKey={item.id}
          style={[
            styles.photo,
            { opacity: imageLoaded ? 1 : thumb ? 0.94 : 0.92 },
          ]}
          contentFit="cover"
          transition={thumb ? 0 : 220}
          cachePolicy="memory-disk"
          priority={thumb ? 'low' : 'high'}
          allowDownscaling
          onLoad={() => {
            setImageLoaded(true);
          }}
          onError={() => {
            setImageFailed(true);
          }}
          accessibilityLabel={item.name}
          accessibilityIgnoresInvertColors
        />
        {!thumb && !imageLoaded ? (
          <View style={styles.photoLoading} pointerEvents="none">
            <ActivityIndicator size="small" color={WC.gold} />
          </View>
        ) : null}
        <View
          style={[styles.neon, size === 'lg' && !frameSoft && styles.neonLg, frameSoft && styles.neonHero]}
          pointerEvents="none"
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wrap,
        size === 'sm' && styles.wrapThumb,
        frameSoft && styles.wrapHero,
        { width: side, height: side },
      ]}
      accessibilityRole="image"
      accessibilityLabel={item.name}
    >
      <LinearGradient colors={g} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.grad}>
        <View style={[styles.neon, size === 'lg' && !frameSoft && styles.neonLg, frameSoft && styles.neonHero]} />
        <Ionicons name={icon} size={iconSz} color={WC.gold} style={styles.iconShadow} />
      </LinearGradient>
    </View>
  );
}

export const MenuItemVisual = memo(MenuItemVisualInner);

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: clientMenuItemFrame.wrapBorder,
    shadowColor: colors.neonFrameGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  /** Liste menu : cadre discret pour ne pas surcharger visuellement. */
  wrapThumb: {
    borderWidth: 1,
    borderColor: clientMenuItemFrame.wrapThumbBorder,
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  /** Fiche produit : une seule lecture de cadre, pas de double néon. */
  wrapHero: {
    borderWidth: 1,
    borderColor: clientMenuItemFrame.wrapHeroBorder,
    shadowColor: colors.shadowPure,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  photoLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: clientMenuItemFrame.photoLoadingBg,
  },
  grad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  neon: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: WC.neonCyanDim,
    borderRadius: radius.lg,
    margin: spacing.xs,
  },
  neonLg: {
    margin: spacing.sm,
    borderWidth: 2,
  },
  neonHero: {
    margin: spacing.xs,
    borderWidth: 1,
    borderColor: clientMenuItemFrame.neonHeroBorder,
  },
  iconShadow: {
    shadowColor: WC.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
  },
});
