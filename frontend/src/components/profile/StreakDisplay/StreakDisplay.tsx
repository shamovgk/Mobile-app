import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';

interface StreakDisplayProps {
  streak: number;
  lastPlayedAt: string | null;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak, lastPlayedAt }) => {
  const isActiveToday = lastPlayedAt && 
    new Date(lastPlayedAt).toDateString() === new Date().toDateString();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🔥</Text>
        <View style={styles.info}>
          <Text style={styles.label}>Серия дней</Text>
          <Text style={styles.streak}>{streak} {getDayWord(streak)}</Text>
        </View>
        {isActiveToday && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Сегодня ✓</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const getDayWord = (count: number): string => {
  if (count % 10 === 1 && count % 100 !== 11) return 'день';
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'дня';
  return 'дней';
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  streak: {
    fontFamily: typography.fontFamily.black,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
  },
  badge: {
    backgroundColor: colors.success.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xs,
    color: colors.success.main,
  },
});
