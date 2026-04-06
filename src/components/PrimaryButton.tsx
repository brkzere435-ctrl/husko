import { LinearGradient } from 'expo-linear-gradient';
import React, { forwardRef } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { componentsVisual } from '@/constants/componentsVisual';
import { colors, radius } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';

const MIN_TOUCH = 52;

const SPRING = { damping: 17, stiffness: 380 };

type Props = PressableProps & {
  title: string;
  variant?: 'primary' | 'ghost';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const PrimaryButton = forwardRef<React.ElementRef<typeof Pressable>, Props>(
  function PrimaryButton({ title, variant = 'primary', icon, style, onPressIn, onPressOut, ...rest }, ref) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handleIn: PressableProps['onPressIn'] = (e) => {
      scale.value = withSpring(0.97, SPRING);
      onPressIn?.(e);
    };
    const handleOut: PressableProps['onPressOut'] = (e) => {
      scale.value = withSpring(1, SPRING);
      onPressOut?.(e);
    };

    if (variant === 'ghost') {
      return (
        <Pressable
          ref={ref}
          accessibilityRole="button"
          onPressIn={handleIn}
          onPressOut={handleOut}
          {...rest}
        >
          <Animated.View style={[styles.ghost, animStyle, style]}>
            {icon ? (
              <View style={styles.row}>
                <View style={styles.iconSlot}>{icon}</View>
                <Text style={[styles.textGhost]}>{title}</Text>
              </View>
            ) : (
              <Text style={styles.textGhost}>{title}</Text>
            )}
          </Animated.View>
        </Pressable>
      );
    }

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        onPressIn={handleIn}
        onPressOut={handleOut}
        {...rest}
      >
        <Animated.View style={[styles.primaryOuter, animStyle, style]}>
          <LinearGradient
            colors={[WC.flyerBlack, WC.flyerCrimsonDeep, WC.flyerCrimson]}
            locations={[0, 0.38, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryGradient}
          >
            {icon ? (
              <View style={styles.row}>
                <View style={styles.iconSlot}>{icon}</View>
                <Text style={styles.text}>{title}</Text>
              </View>
            ) : (
              <Text style={styles.text}>{title}</Text>
            )}
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  primaryOuter: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: componentsVisual.primaryOuterBorder,
    minHeight: MIN_TOUCH,
    ...Platform.select({
      ios: {
        shadowColor: WC.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  primaryGradient: {
    minHeight: MIN_TOUCH - 4,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    minHeight: MIN_TOUCH,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: componentsVisual.ghostBg,
    borderWidth: 1,
    borderColor: componentsVisual.ghostBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconSlot: { justifyContent: 'center', alignItems: 'center' },
  text: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  textGhost: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 16,
  },
});
