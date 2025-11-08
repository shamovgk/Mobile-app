import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePack } from '@/lib/hooks/useContentFetch';

export default function PackScreen() {
  const router = useRouter();
  const { packId } = useLocalSearchParams<{ packId: string }>();

  const { data: pack, isLoading, error } = usePack(packId);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (error || !pack) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Ошибка загрузки</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Вернуться</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleLevelPress = (levelId: string) => {
    // ✅ ПРАВИЛЬНЫЙ способ передачи параметра
    router.push(`/(main)/game/${levelId}`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Назад</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{pack.title}</Text>
      <Text style={styles.description}>{pack.description}</Text>

      <FlatList
        data={pack.levels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.levelCard}
            onPress={() => handleLevelPress(item.id)}
          >
            <View style={styles.levelNumber}>
              <Text style={styles.levelNumberText}>{item.levelNumber}</Text>
            </View>

            <View style={styles.levelInfo}>
              <Text style={styles.levelMode}>
                {item.mode === 'lives' ? '❤️' : '⏱️'} {item.mode}
              </Text>
              <Text style={styles.levelWords}>{item.lexemesCount} слов</Text>
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
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginTop: 8,
    color: '#2C3E50',
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  listContent: {
    padding: 16,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelNumberText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  levelInfo: {
    flex: 1,
  },
  levelMode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  levelWords: {
    fontSize: 14,
    color: '#7F8C8D',
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
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
