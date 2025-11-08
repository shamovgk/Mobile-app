import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePacks } from '@/lib/hooks/useContentFetch';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function HomeScreen() {
  const router = useRouter();
  const { data: packs, isLoading, error } = usePacks();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login' as any);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Загрузка паков...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ Ошибка загрузки</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Word Rush</Text>
          <Text style={styles.welcomeText}>
            Привет, {user?.displayName || 'Гость'}!
          </Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            style={styles.profileButton}
          >
            <Text style={styles.profileButtonText}>👤</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutButtonText}>Выйти</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.subtitle}>Выберите пак для изучения</Text>

      <FlatList
        data={packs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.packCard}
            onPress={() => router.push(`/pack/${item.id}`)}
          >
            <Text style={styles.packTitle}>{item.title}</Text>
            <Text style={styles.packDescription}>{item.description}</Text>
            <View style={styles.packMeta}>
              <Text style={styles.packDifficulty}>{item.difficulty}</Text>
              <Text style={styles.packLevels}>{item.levelsCount} уровней</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  welcomeText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#357ABD',
  },
  profileButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  logoutButtonText: {
    color: '#E74C3C',
    fontSize: 13,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7F8C8D',
    marginBottom: 24,
    marginHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  packCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  packDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  packMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  packDifficulty: {
    fontSize: 12,
    color: '#4A90E2',
    textTransform: 'capitalize',
  },
  packLevels: {
    fontSize: 12,
    color: '#95A5A6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7F8C8D',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
