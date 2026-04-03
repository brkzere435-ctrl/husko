import type { ComponentProps } from 'react';
import { memo, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import type { MenuCategory, MenuItem } from '@/constants/menu';
import { getMenuImage } from '@/constants/menuImages';
import { WC } from '@/constants/westCoastTheme';
import { radius, spacing } from '@/constants/theme';

const CAT_ICON: Record<MenuCategory, ComponentProps<typeof Ionicons>['name']> = {
  smash: 'flame',
  frites: 'fast-food',
  baguette: 'restaurant',
  sandwich: 'nutrition',
  four: 'bonfire',
  dessert: 'ice-cream',
  boisson: 'water',
};

const CAT_GRAD: Record<MenuCategory, [string, string, string]> = {
  smash: ['#7f1d1d', '#3b0764', '#0c0a09'],
  frites: ['#78350f', '#7f1d1d', '#1c1917'],
  baguette: ['#854d0e', '#451a03', '#0c0a09'],
  sandwich: ['#991b1b', '#134e4a', '#0f172a'],
  four: ['#9a3412', '#7c2d12', '#1c1917'],
  dessert: ['#831843', '#4c0519', '#0f172a'],
  boisson: ['#0e7490', '#164e63', '#0c4a6e'],
};

type Props = { item: MenuItem; size: 'sm' | 'lg' };

function MenuItemVisualInner({ item, size }: Props) {
  const side = size === 'lg' ? 220 : 72;
  const iconSz = size === 'lg' ? 88 : 32;
  const g = CAT_GRAD[item.category];
  const icon = CAT_ICON[item.category];
  const photo = getMenuImage(item);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [item.id]);

  if (photo && !imageFailed) {
    const placeholderBg = CAT_GRAD[item.category][0];
    const thumb = size === 'sm';
    return (
      <View style={[styles.wrap, { width: side, height: side, backgroundColor: placeholderBg }]}>
        <Image
          source={photo}
          recyclingKey={item.id}
          style={styles.photo}
          contentFit="cover"
          transition={thumb ? 0 : 220}
          cachePolicy="memory-disk"
          priority={thumb ? 'low' : 'high'}
          allowDownscaling
          onError={() => setImageFailed(true)}
          accessibilityLabel={item.name}
          accessibilityIgnoresInvertColors
        />
        <View style={[styles.neon, size === 'lg' && styles.neonLg]} pointerEvents="none" />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { width: side, height: side }]}>
      <LinearGradient colors={g} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.grad}>
        <View style={[styles.neon, size === 'lg' && styles.neonLg]} />
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
    borderColor: 'rgba(34, 211, 238, 0.5)',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
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
  iconShadow: {
    shadowColor: WC.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
  },
});
