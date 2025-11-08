import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth.store';
import { progressApi } from '@/lib/api/services/progress.service';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const { data: progress, isLoading, error } = useQuery({
    queryKey: ['userProgress'],
    queryFn: progressApi.getProgress,
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login' as any);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Заголовок */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{user?.displayName || 'Игрок'}</Text>
          <Text style={styles.subtitle}>
            {user?.isGuest ? '👤 Гостевой режим' : '✅ Зарегистрирован'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
      </View>

      {/* Статистика профиля */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Уровень</Text>
          <Text style={styles.statValue}>{progress?.profile.level || 1}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>XP</Text>
          <Text style={styles.statValue}>{progress?.profile.totalXp || 0}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Серия</Text>
          <Text style={styles.statValue}>{progress?.profile.streak || 0}</Text>
        </View>
      </View>

      {/* Достижения */}
      {progress?.achievements && progress.achievements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Достижения</Text>
          <View style={styles.achievementsGrid}>
            {progress.achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <Text style={styles.achievementIcon}>
                  {achievement.achievement.icon}
                </Text>
                <Text style={styles.achievementTitle}>
                  {achievement.achievement.title}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Прогресс по уровням */}
      {progress?.levelProgress && progress.levelProgress.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Прогресс</Text>
          <Text style={styles.levelCount}>
            Пройдено уровней: {progress.levelProgress.length}
          </Text>
          <View style={styles.progressBars}>
            {progress.levelProgress.slice(0, 5).map((level, index) => (
              <View key={index} style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(level.highestStars / 3) * 100}%`,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Кнопка назад */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>← Назад</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  logoutText: {
    color: '#E74C3C',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  levelCount: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '30%',
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 11,
    color: '#2C3E50',
    textAlign: 'center',
  },
  progressBars: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
});
