// frontend/src/components/animations/Confetti.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

export const Confetti: React.FC = () => {
  // Временная заглушка - анимация будет добавлена позже
  return <View style={styles.container} pointerEvents="none" />;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});
