/**
 * Базовый контейнер приложения
 */

import { COLORS, COMMON_STYLES } from '@/constants/design-system';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

interface ContainerProps extends ViewProps {
  variant?: 'default' | 'game' | 'card';
  safe?: boolean;
}

export function Container({ 
  variant = 'default', 
  style, 
  children, 
  ...props 
}: ContainerProps) {
  const containerStyle = variant === 'game' 
    ? styles.gameContainer
    : variant === 'card'
    ? styles.cardContainer
    : styles.defaultContainer;

  return (
    <View style={[containerStyle, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  defaultContainer: COMMON_STYLES.container,
  gameContainer: {
    flex: 1,
    backgroundColor: COLORS.game.background,
    padding: 16,
  },
  cardContainer: COMMON_STYLES.card,
});
