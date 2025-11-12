import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { dictionaryApi } from '@/lib/api/services/dictionary.service';
import { LexemeCard } from '@/components/dictionary/lexeme-card';
import { DictionaryStats } from '@/components/dictionary/dictionary-stats';

type FilterType = 'all' | 'mastered' | 'learning' | 'notStarted';

export default function DictionaryScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['dictionary'],
    queryFn: dictionaryApi.getDictionary,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Обновить при возвращении на экран
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Загрузка словаря...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Ошибка загрузки словаря</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Вернуться</Text>
        </TouchableOpacity>
      </View>
    );
  }

  let filteredWords = data.dictionary;

  if (filter === 'mastered') {
    filteredWords = filteredWords.filter((w) => w.mastery >= 5);
  } else if (filter === 'learning') {
    filteredWords = filteredWords.filter((w) => w.mastery >= 1 && w.mastery < 5);
  } else if (filter === 'notStarted') {
    filteredWords = filteredWords.filter((w) => w.mastery === 0);
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredWords = filteredWords.filter(
      (w) => w.form.toLowerCase().includes(query) || w.meaning.toLowerCase().includes(query)
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Словарь</Text>
      </View>

      <DictionaryStats
        masteredCount={data.stats.mastered}
        learningCount={data.stats.learning}
        notStartedCount={data.stats.notStarted}
      />

      <TextInput
        style={styles.searchInput}
        placeholder="Поиск слова..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.filters}>
        {(['all', 'mastered', 'learning', 'notStarted'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
          >
            <Text style={[styles.filterButtonText, filter === f && styles.filterButtonTextActive]}>
              {f === 'all' ? 'Все' : f === 'mastered' ? 'Освоены' : f === 'learning' ? 'Изучаю' : 'Не начаты'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredWords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LexemeCard
            base={item.form}
            translation={item.meaning}
            mastery={item.mastery}
            recentMistakes={item.wrongAttempts > 0 ? [`Ошибок: ${item.wrongAttempts}`] : []}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4A90E2" />
        }
        ListEmptyComponent={<Text style={styles.emptyText}>Слова не найдены</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', paddingTop: 60 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: { paddingVertical: 8, marginRight: 16 },
  backButtonText: { fontSize: 16, color: '#4A90E2' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50' },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  filterButtonText: { fontSize: 14, color: '#7F8C8D' },
  filterButtonTextActive: { color: '#FFFFFF', fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#7F8C8D', marginTop: 32 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#7F8C8D' },
  errorText: { fontSize: 18, fontWeight: 'bold', color: '#E74C3C', marginBottom: 8 },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
