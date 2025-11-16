import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

interface TimerDisplayProps {
  timeLeft: number;
  totalTime: number;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, totalTime }) => {
  const percentage = (timeLeft / totalTime) * 100;
  const isUrgent = percentage < 20;

  return (
    <View style={styles.container}>
      <Text style={[styles.time, isUrgent && styles.timeUrgent]}>
        {timeLeft}s
      </Text>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${percentage}%` },
            isUrgent && styles.progressUrgent,
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minWidth: 60,
  },
  time: {
    fontFamily: typography.fontFamily.black,
    fontSize: typography.fontSize.lg,
    color: colors.accent.main,
    marginBottom: 4,
  },
  timeUrgent: {
    color: colors.error.main,
  },
  progressBar: {
    width: 50,
    height: 4,
    backgroundColor: colors.primary.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.main,
  },
  progressUrgent: {
    backgroundColor: colors.error.main,
  },
});
