import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    levelId: string;
    score: string;
    stars: string;
    totalLexemes: string;
    correctAnswers?: string;
    wrongAnswers?: string;
  }>();

  const score = parseInt(params.score || '0');
  const stars = parseInt(params.stars || '0');
  const total = parseInt(params.totalLexemes || '0');
  const correct = parseInt(params.correctAnswers || '0');
  const wrong = parseInt(params.wrongAnswers || '0');

  const handleRetry = () => {
    router.push(`/(main)/game/${params.levelId}`);
  };

  const handleBackToPack = () => {
    router.back();
    router.back(); // Назад дважды (result → game → pack)
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {stars >= 2 ? '🎉 Отлично!' : stars === 1 ? '👍 Хорошо!' : '💪 Попробуйте ещё'}
        </Text>

        {/* Stars */}
        <View style={styles.starsContainer}>
          {[1, 2, 3].map((star) => (
            <Text key={star} style={styles.star}>
              {star <= stars ? '⭐' : '☆'}
            </Text>
          ))}
        </View>

        {/* Score */}
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.subtitle}>очков</Text>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{correct}</Text>
            <Text style={styles.statLabel}>✓ Правильно</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{wrong}</Text>
            <Text style={styles.statLabel}>✗ Ошибок</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statLabel}>Всего</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleRetry} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>🔄 Повторить</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleBackToPack} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>← К уровням</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 60,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  star: {
    fontSize: 48,
  },
  score: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#7F8C8D',
    marginBottom: 32,
  },
  stats: {
    flexDirection: 'row',
    gap: 24,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingTop: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  actions: {
    gap: 12,
    marginTop: 32,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
  },
});
