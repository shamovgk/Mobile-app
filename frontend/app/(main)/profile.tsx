import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/lib/stores/auth.store';
import { progressApi } from '@/lib/api/services/progress.service';
import { useRefreshData } from '@/lib/hooks/useRefreshData';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { refreshAll } = useRefreshData();

  const { data: progress, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['userProgress'],
    queryFn: progressApi.getProgress,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  useFocusEffect(
    React.useCallback(() => {
      refreshAll();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login' as any);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refreshAll} tintColor="#4A90E2" />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{user?.displayName}</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.displayName?.charAt(0).toUpperCase() || '?'}</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.profile?.level || 1}</Text>
            <Text style={styles.statLabel}>Уровень</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.profile?.totalXp || 0}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.profile?.streak || 0}</Text>
            <Text style={styles.statLabel}>Серия</Text>
          </View>
        </View>
      </View>

      {progress && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Пройдено уровней</Text>
          {progress.levelProgress.map((lp: any) => (
            <View key={lp.id} style={styles.levelCard}>
              <Text style={styles.levelTitle}>
                {lp.level.pack.title} - Уровень {lp.level.levelNumber}
              </Text>
              <View style={styles.levelStats}>
                <Text style={styles.levelStat}>⭐ {lp.highestStars}/3</Text>
                <Text style={styles.levelStat}>🏆 {lp.bestScore}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Выйти</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  content: { paddingBottom: 32 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: { paddingVertical: 8, marginBottom: 8 },
  backButtonText: { fontSize: 16, color: '#4A90E2' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50' },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF' },
  stats: { flexDirection: 'row', gap: 32 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50' },
  statLabel: { fontSize: 14, color: '#7F8C8D', marginTop: 4 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 12 },
  levelCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 8 },
  levelTitle: { fontSize: 16, fontWeight: '600', color: '#2C3E50' },
  levelStats: { flexDirection: 'row', gap: 16, marginTop: 8 },
  levelStat: { fontSize: 14, color: '#7F8C8D' },
  logoutButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
