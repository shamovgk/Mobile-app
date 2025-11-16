// frontend/src/screens/game/LevelStartScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { Button } from '@/components/ui/Button/Button';
import { useLevel } from '@/hooks/useContentFetch';
import type { RootStackParamList } from '@/navigation/types';

type LevelStartScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LevelStart'>;
type LevelStartScreenRouteProp = RouteProp<RootStackParamList, 'LevelStart'>;

export const LevelStartScreen: React.FC = () => {
  const navigation = useNavigation<LevelStartScreenNavigationProp>();
  const route = useRoute<LevelStartScreenRouteProp>();
  const { levelId } = route.params;
  const { data: levelData, isLoading } = useLevel(levelId);

  const handleStart = () => {
    navigation.navigate('Game', { levelId });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getModeInfo = () => {
    switch (levelData?.mode) {
      case 'LEARNING':
        return {
          icon: '📚',
          title: 'Режим обучения',
          description: 'Изучай новые слова в комфортном темпе',
        };
      case 'SPEED':
        return {
          icon: '⚡',
          title: 'Скоростной режим',
          description: 'Проверь свою скорость реакции!',
        };
      case 'CHALLENGE':
        return {
          icon: '🏆',
          title: 'Испытание',
          description: 'Самый сложный уровень для настоящих мастеров',
        };
      default:
        return {
          icon: '🎯',
          title: 'Тренировка',
          description: 'Закрепи изученные слова',
        };
    }
  };

  if (isLoading || !levelData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const modeInfo = getModeInfo();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button variant="ghost" onPress={handleBack}>
          ← Назад
        </Button>
      </View>

      <View style={styles.content}>
        <Text style={styles.modeIcon}>{modeInfo.icon}</Text>
        <Text style={styles.modeTitle}>{modeInfo.title}</Text>
        <Text style={styles.modeDescription}>{modeInfo.description}</Text>

        <View style={styles.levelInfo}>
          <Text style={styles.levelNumber}>Уровень {levelData.levelNumber}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>❓</Text>
            <Text style={styles.statValue}>{levelData.questions.length}</Text>
            <Text style={styles.statLabel}>Вопросов</Text>
          </View>

          {levelData.timeLimit && (
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={styles.statValue}>{levelData.timeLimit}s</Text>
              <Text style={styles.statLabel}>Время</Text>
            </View>
          )}

          {levelData.lives && (
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>❤️</Text>
              <Text style={styles.statValue}>{levelData.lives}</Text>
              <Text style={styles.statLabel}>Жизней</Text>
            </View>
          )}

          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statValue}>{levelData.targetScore}</Text>
            <Text style={styles.statLabel}>Цель</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            variant="primary"
            size="large"
            onPress={handleStart}
            fullWidth
          >
            Начать уровень
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  modeIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  modeTitle: {
    fontFamily: typography.fontFamily.black,
    fontSize: typography.fontSize.xxxl,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modeDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  levelInfo: {
    backgroundColor: colors.accent.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
  },
  levelNumber: {
    fontFamily: typography.fontFamily.black,
    fontSize: typography.fontSize.xl,
    color: colors.primary.main,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statItem: {
    backgroundColor: colors.background.paper,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: typography.fontSize.xxl,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontFamily: typography.fontFamily.black,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  actions: {
    width: '100%',
    marginTop: spacing.xl,
  },
});
