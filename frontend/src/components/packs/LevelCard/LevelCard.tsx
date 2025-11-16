import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';

interface LevelCardProps {
  levelNumber: number;
  stars: number;
  maxStars: number;
  isLocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  mode: string;
  onPress: () => void;
}

export const LevelCard: React.FC<LevelCardProps> = ({
  levelNumber,
  stars,
  maxStars,
  isLocked,
  isCompleted,
  isCurrent,
  mode,
  onPress,
}) => {
  const getModeIcon = () => {
    switch (mode) {
      case 'LEARNING':
        return '📚';
      case 'SPEED':
        return '⚡';
      case 'CHALLENGE':
        return '🏆';
      default:
        return '🎯';
    }
  };

  const getStatusStyle = () => {
    if (isLocked) return styles.levelLocked;
    if (isCompleted) return styles.levelCompleted;
    if (isCurrent) return styles.levelCurrent;
    return styles.levelAvailable;
  };

  return (
    <View style={styles.container}>
      <View style={styles.connector} />
      
      <TouchableOpacity
        style={[styles.level, getStatusStyle()]}
        onPress={onPress}
        disabled={isLocked}
        activeOpacity={0.8}
      >
        {isLocked ? (
          <Text style={styles.lockIcon}>🔒</Text>
        ) : (
          <>
            <Text style={styles.levelNumber}>{levelNumber}</Text>
            <Text style={styles.modeIcon}>{getModeIcon()}</Text>
          </>
        )}
      </TouchableOpacity>

      {!isLocked && (
        <View style={styles.starsContainer}>
          {Array.from({ length: maxStars }).map((_, index) => (
            <Text key={index} style={styles.star}>
              {index < stars ? '⭐' : '☆'}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  connector: {
    width: 4,
    height: 40,
    backgroundColor: colors.primary.light,
    position: 'absolute',
    top: -40,
    zIndex: -1,
  },
  level: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  levelAvailable: {
    backgroundColor: colors.background.paper,
    borderColor: colors.primary.light,
  },
  levelCurrent: {
    backgroundColor: colors.accent.light,
    borderColor: colors.accent.main,
  },
  levelCompleted: {
    backgroundColor: colors.success.light,
    borderColor: colors.success.main,
  },
  levelLocked: {
    backgroundColor: colors.background.default,
    borderColor: colors.text.disabled,
    opacity: 0.6,
  },
  levelNumber: {
    fontFamily: typography.fontFamily.black,
    fontSize: typography.fontSize.xxl,
    color: colors.primary.main,
  },
  modeIcon: {
    fontSize: typography.fontSize.md,
    marginTop: -spacing.xs,
  },
  lockIcon: {
    fontSize: typography.fontSize.xxl,
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  star: {
    fontSize: typography.fontSize.md,
  },
});
