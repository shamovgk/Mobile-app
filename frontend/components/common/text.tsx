/**
 * Типизированный текстовый компонент (ИСПРАВЛЕНО)
 */

import { COLORS, FONT_SIZES, FONT_WEIGHTS, FONTS } from '@/constants/design-system';
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';

interface TextProps extends RNTextProps {
  variant?: 'body' | 'caption' | 'title' | 'hero' | 'button';
  color?: 'primary' | 'secondary' | 'white' | 'error' | 'success';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
}

export function Text({ 
  variant = 'body',
  color = 'primary',
  weight = 'normal',
  align = 'left',
  style,
  ...props 
}: TextProps) {
  const textStyle: TextStyle[] = [
    styles.base,
    styles[variant],
    getColorStyle(color),
    getWeightStyle(weight),
    { textAlign: align },
  ];

  return <RNText style={[...textStyle, style]} {...props} />;
}

// Функции для получения стилей
function getColorStyle(color: string): TextStyle {
  switch (color) {
    case 'primary': return styles.colorPrimary;
    case 'secondary': return styles.colorSecondary;
    case 'white': return styles.colorWhite;
    case 'error': return styles.colorError;
    case 'success': return styles.colorSuccess;
    default: return styles.colorPrimary;
  }
}

function getWeightStyle(weight: string): TextStyle {
  switch (weight) {
    case 'normal': return styles.weightNormal;
    case 'medium': return styles.weightMedium;
    case 'semibold': return styles.weightSemibold;
    case 'bold': return styles.weightBold;
    default: return styles.weightNormal;
  }
}

const styles = StyleSheet.create({
  base: {
    fontFamily: FONTS?.regular,
  },
  
  // Варианты
  body: {
    fontSize: FONT_SIZES.md,
    lineHeight: FONT_SIZES.md * 1.5,
  },
  caption: {
    fontSize: FONT_SIZES.sm,
    lineHeight: FONT_SIZES.sm * 1.4,
  },
  title: {
    fontSize: FONT_SIZES.title,
    lineHeight: FONT_SIZES.title * 1.2,
  },
  hero: {
    fontSize: FONT_SIZES.hero,
    lineHeight: FONT_SIZES.hero * 1.2,
  },
  button: {
    fontSize: FONT_SIZES.md,
    lineHeight: FONT_SIZES.md * 1.2,
  },
  
  // Цвета
  colorPrimary: { color: COLORS.gray900 },
  colorSecondary: { color: COLORS.gray600 },
  colorWhite: { color: COLORS.white },
  colorError: { color: COLORS.error },
  colorSuccess: { color: COLORS.success },
  
  // Веса
  weightNormal: { fontWeight: FONT_WEIGHTS.normal },
  weightMedium: { fontWeight: FONT_WEIGHTS.medium },
  weightSemibold: { fontWeight: FONT_WEIGHTS.semibold },
  weightBold: { fontWeight: FONT_WEIGHTS.bold },
});
