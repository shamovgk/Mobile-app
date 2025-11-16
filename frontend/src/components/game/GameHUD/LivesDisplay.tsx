import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

interface LivesDisplayProps {
  current: number;
  max: number;
}

export const LivesDisplay: React.FC<LivesDisplayProps> = ({ current, max }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Жизни</Text>
      <View style={styles.heartsContainer}>
        {Array.from({ length: max }).map((_, index) => (
          <Text key={index} style={styles.heart}>
            {index < current ? '❤️' : '🖤'}
          </Text>
        ))}
      </View>
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
  heartsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  heart: {
    fontSize: typography.fontSize.lg,
  },
});
