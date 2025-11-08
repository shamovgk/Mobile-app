/**
 * Кастомная кнопка (ОКОНЧАТЕЛЬНОЕ ИСПРАВЛЕНИЕ)
 */

import { BORDER_RADIUS, COLORS, LAYOUT, SHADOWS, SPACING } from '@/constants/design-system';
import React from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleSheet, View } from 'react-native';
import { Text } from './text';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  children: string;
  style?: any;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  icon,
  children,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  
  const getButtonStyle = () => {
    return [
      styles.base,
      styles[variant],
      styles[size],
      isDisabled && styles.disabled,
      style,
    ];
  };
  
  const textColor = variant === 'primary' || variant === 'danger' ? 'white' : 'primary';

  return (
    <Pressable
      style={({ pressed }) => [
        ...getButtonStyle(),
        pressed && !isDisabled && styles.pressed,
      ]}
      disabled={isDisabled}
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={textColor === 'white' ? COLORS.white : COLORS.primary} />
        ) : (
          <>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text variant="button" color={textColor} weight="semibold">
              {children}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.lg,
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  
  icon: {
    marginRight: SPACING.xs,
  },
  
  // Варианты
  primary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  secondary: {
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: COLORS.error,
    ...SHADOWS.md,
  },
  
  // Размеры
  small: {
    height: 36,
    paddingHorizontal: SPACING.md,
  },
  medium: {
    height: LAYOUT.button.height,
    paddingHorizontal: SPACING.lg,
  },
  large: {
    height: 56,
    paddingHorizontal: SPACING.xl,
  },
  
  // Состояния
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
});
