// frontend/src/screens/game/ResultScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { Button } from '@/components/ui/Button/Button';
import { Confetti } from '@/components/animations/Confetti';
import { progressApi } from '@/lib/api/services/progress.service';
import type { RootStackParamList } from '@/navigation/types';

type ResultScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Result'>;
type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

export const ResultScreen: React.FC = () => {
  const navigation = useNavigation<ResultScreenNavigationProp>();
  const route = useRoute<ResultScreenRouteProp>();
  const { levelId, score, stars, correctAnswers, wrongAnswers, duration, isWin } = route.params;

  useEffect(() => {
    submitResult();
  }, []);

  const submitResult = async () => {
    try {
      await progressApi.submitResult({
        levelId,
        score,
        stars,
        correctAnswers,
        wrongAnswers,
        duration,
      });
    } catch (error) {
      console.error('Failed to submit result:', error);
    }
  };

  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleRetry = () => {
    navigation.goBack();
  };

  const totalAnswers = correctAnswers + wrongAnswers;
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      {isWin && <Confetti />}
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isWin ? '🎉 Отлично!' : '💪 Попробуй ещё раз'}
          </Text>
          <Text style={styles.subtitle}>
            {isWin ? 'Уровень пройден!' : 'Не получилось с первого раза'}
          </Text>
        </View>

        <View style={styles.starsContainer}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Text key={index} style={styles.star}>
              {index < stars ? '⭐' : '☆'}
            </Text>
          ))}
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.mainScore}>
            <Text style={styles.scoreLabel}>Очки</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statValue}>{correctAnswers}</Text>
            <Text style={styles.statLabel}>Правильно</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>❌</Text>
            <Text style={styles.statValue}>{wrongAnswers}</Text>
            <Text style={styles.statLabel}>Неправильно</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Точность</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statValue}>{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</Text>
            <Text style={styles.statLabel}>Время</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            variant="primary"
            size="large"
            onPress={handleContinue}
            fullWidth
          >
            {isWin ? 'Продолжить' : 'На главную'}
          </Button>

          <Button
            variant="outline"
            size="large"
            onPress={handleRetry}
            fullWidth
          >
            Попробовать снова
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: typography.fontFamily.black,
    fontSize: typography.fontSize.xxxl,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  star: {
    fontSize: 48,
  },
  scoreCard: {
    backgroundColor: colors.accent.main,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.accent.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  mainScore: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  scoreValue: {
    fontFamily: typography.fontFamily.black,
    fontSize: typography.fontSize.huge,
    color: colors.primary.main,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    fontSize: typography.fontSize.xxxl,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontFamily: typography.fontFamily.black,
    fontSize: typography.fontSize.xxl,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  actions: {
    gap: spacing.md,
  },
});
