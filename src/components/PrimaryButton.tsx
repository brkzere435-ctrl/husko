import { LinearGradient } from 'expo-linear-gradient';
import React, { forwardRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius } from '@/constants/theme';

const MIN_TOUCH = 52;

type Props = PressableProps & {
  title: string;
  variant?: 'primary' | 'ghost';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const PrimaryButton = forwardRef<React.ElementRef<typeof Pressable>, Props>(
  function PrimaryButton({ title, variant = 'primary', icon, style, ...rest }, ref) {
    if (variant === 'ghost') {
      return (
        <Pressable
          ref={ref}
          accessibilityRole="button"
          style={({ pressed }) => [styles.ghost, pressed && styles.pressed, style]}
          {...rest}
        >
          {icon ? (
            <View style={styles.row}>
              <View style={styles.iconSlot}>{icon}</View>
              <Text style={[styles.textGhost]}>{title}</Text>
            </View>
          ) : (
            <Text style={styles.textGhost}>{title}</Text>
          )}
        </Pressable>
      );
    }

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        style={({ pressed }) => [styles.primaryOuter, pressed && styles.pressed, style]}
        {...rest}
      >
        <LinearGradient
          colors={[colors.accentDeep, colors.accent]}
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
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  primaryOuter: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.goldDim,
    minHeight: MIN_TOUCH,
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
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  pressed: { opacity: 0.9 },
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
