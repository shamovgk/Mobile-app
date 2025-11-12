import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { contentApi } from '@/lib/api/services/content.service';
import { progressApi } from '@/lib/api/services/progress.service';
import { buildSessionPlan } from '@/lib/game/engine';
import { useRefreshData } from '@/lib/hooks/useRefreshData';
import type { SessionSlot } from '@/lib/types';

import { MeaningQuestion } from '@/components/game/MeaningQuestion';
import { FormQuestion } from '@/components/game/FormQuestion';
import { ContextQuestion } from '@/components/game/ContextQuestion';
import { AnagramQuestion } from '@/components/game/AnagramQuestion';
import { GameHUD } from '@/components/game/GameHUD';
import { PauseModal } from '@/components/game/PauseModal';

export default function GameScreen() {
  const router = useRouter();
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const { refreshAll } = useRefreshData();

  const { data: level, isLoading, error } = useQuery({
    queryKey: ['level', levelId],
    queryFn: async () => {
      const data = await contentApi.getLevel(levelId!);
      console.log('🎮 Level loaded:', data.lexemes.length, 'lexemes');
      return data;
    },
    enabled: !!levelId,
  });

  const [session, setSession] = useState<SessionSlot[] | null>(null);
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const startTime = useState(Date.now())[0];
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (level && !session) {
      const seed = `${levelId}-${Date.now()}`;
      const sessionPlan = buildSessionPlan({
        pack: {
          id: level.pack.id,
          title: level.pack.title,
          lexemes: level.lexemes.map((lex) => ({
            id: lex.id,
            base: lex.form,
            forms: {},
            translations: [lex.meaning],
            examples: lex.contexts,
            distractors: {},
          })),
        } as any,
        level: {
          durationSec: 120,
          lanes: 3,
          allowedTypes: ['meaning', 'form', 'context', 'anagram'],
          lives: 3,
        },
        seed,
      });

      setSession(sessionPlan.slots);
      console.log('🎲 Session created with', sessionPlan.slots.length, 'questions');
    }
  }, [level, session, levelId]);

  if (!levelId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Ошибка: нет ID уровня</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Вернуться</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading || !session) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Загрузка игры...</Text>
      </View>
    );
  }

  if (error || !level) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Ошибка загрузки уровня</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Вернуться</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleGameEnd = async () => {
    setIsSubmitting(true);
    try {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const correctAnswers = session.length - errors.length;
      const wrongAnswers = errors.length;
      const accuracy = correctAnswers / session.length;
      const stars = lives > 0 ? Math.min(3, Math.ceil(accuracy * 3)) : 0;

      await progressApi.submitResult({
        levelId: level.id,
        score: Math.floor(score),
        stars,
        correctAnswers,
        wrongAnswers,
        duration,
      });

      // ✅ Обновить все данные одним вызовом
      await refreshAll();

      router.push({
        pathname: '/(main)/result',
        params: {
          levelId: level.id,
          score: Math.floor(score),
          stars,
          totalLexemes: session.length,
          correctAnswers,
          wrongAnswers,
        },
      } as any);
    } catch (err) {
      console.error('Error submitting result:', err);
      Alert.alert('Ошибка', 'Не удалось сохранить результат');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isGameOver = lives <= 0 || currentSlotIndex >= session.length;

  if (isGameOver) {
    const isWon = currentSlotIndex >= session.length && lives > 0;

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.resultTitle}>{isWon ? '🎉 Победа!' : '😢 Поражение'}</Text>
        <Text style={styles.resultScore}>{Math.floor(score)}</Text>
        <Text style={styles.resultInfo}>
          {session.length - errors.length}/{session.length} правильных
        </Text>

        <TouchableOpacity onPress={handleGameEnd} style={styles.button} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Завершить</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(`/(main)/pack/${level.pack.id}`)}
          style={styles.secondaryButton}
          disabled={isSubmitting}
        >
          <Text style={styles.secondaryButtonText}>Вернуться к паку</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentSlot = session[currentSlotIndex];

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      const comboBonus = combo >= 3 ? Math.floor(combo / 3) * 5 : 0;
      const basePoints = 10;
      const newScore = score + basePoints + comboBonus;
      const newCombo = combo + 1;

      setScore(newScore);
      setCombo(newCombo);
      setCurrentSlotIndex(currentSlotIndex + 1);
    } else {
      setLives(lives - 1);
      setCombo(0);
      setErrors([...errors, currentSlot.lexemeId]);
    }
  };

  const renderQuestion = () => {
    switch (currentSlot.type) {
      case 'meaning':
        return <MeaningQuestion slot={currentSlot} onAnswer={handleAnswer} />;
      case 'form':
        return <FormQuestion slot={currentSlot} onAnswer={handleAnswer} />;
      case 'context':
        return <ContextQuestion slot={currentSlot} onAnswer={handleAnswer} />;
      case 'anagram':
        return <AnagramQuestion slot={currentSlot} onAnswer={handleAnswer} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <GameHUD
        score={score}
        lives={lives}
        currentQuestion={currentSlotIndex + 1}
        totalQuestions={session.length}
        combo={combo}
        onPause={() => setIsPaused(true)}
      />

      <View style={{ flex: 1, paddingVertical: 24 }}>{renderQuestion()}</View>

      <PauseModal
        visible={isPaused}
        onResume={() => setIsPaused(false)}
        onExit={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7F8C8D',
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 8,
  },
  resultInfo: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 32,
  },
});
