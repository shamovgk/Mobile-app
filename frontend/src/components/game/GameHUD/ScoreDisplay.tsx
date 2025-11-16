// frontend/src/components/game/GameHUD/ScoreDisplay.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

interface ScoreDisplayProps {
  score: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Очки</Text>
      <Text style={styles.score}>{score}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
    opacity: 0.8,
    marginBottom: 2,
  },
  score: {
    fontFamily: typography.fontFamily.black,
    fontSize: typography.fontSize.xl,
    color: colors.accent.main,
  },
});
