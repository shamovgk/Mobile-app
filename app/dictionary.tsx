/**
 * Словарь пака с прогрессом и визуальными улучшениями
 * 
 * Функционал:
 * - Отображение всех слов с переводами
 * - Индикаторы мастерства (0-5)
 * - Поиск по словам
 * - Фильтрация по уровню мастерства
 * - Сортировка (по алфавиту, по прогрессу)
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getPackById } from '@/lib/content';
import { getPackLexemesWithProgress } from '@/lib/storage';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';

type LexemeWithProgress = {
  id: string;
  base: string;
  translation: string;
  mastery: number;
  recentMistakes: string[];
};

type SortMode = 'alphabet' | 'mastery-asc' | 'mastery-desc';
type FilterMode = 'all' | 'learning' | 'mastered';

export default function DictionaryScreen() {
  const { packId } = useLocalSearchParams<{ packId: string }>();
  const pack = getPackById(packId!)!;

  const [lexemes, setLexemes] = useState<LexemeWithProgress[]>([]);
  const [filteredLexemes, setFilteredLexemes] = useState<LexemeWithProgress[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('alphabet');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  /**
   * Загрузка слов с прогрессом
   */
  useEffect(() => {
    (async () => {
      const data = await getPackLexemesWithProgress(pack);
      setLexemes(data);
      setFilteredLexemes(data);
    })();
  }, [pack]);

  /**
   * Применение фильтров и сортировки
   */
  useEffect(() => {
    let result = [...lexemes];

    // Поиск
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (lx) =>
          lx.base.toLowerCase().includes(query) || lx.translation.toLowerCase().includes(query)
      );
    }

    // Фильтрация по мастерству
    if (filterMode === 'learning') {
      result = result.filter((lx) => lx.mastery < 4);
    } else if (filterMode === 'mastered') {
      result = result.filter((lx) => lx.mastery >= 4);
    }

    // Сортировка
    if (sortMode === 'alphabet') {
      result.sort((a, b) => a.base.localeCompare(b.base));
    } else if (sortMode === 'mastery-asc') {
      result.sort((a, b) => a.mastery - b.mastery);
    } else if (sortMode === 'mastery-desc') {
      result.sort((a, b) => b.mastery - a.mastery);
    }

    setFilteredLexemes(result);
  }, [searchQuery, sortMode, filterMode, lexemes]);

  /**
   * Получение цвета для уровня мастерства
   */
  const getMasteryColor = (mastery: number): string => {
    if (mastery === 0) return '#f44336'; // Красный
    if (mastery === 1) return '#ff9800'; // Оранжевый
    if (mastery === 2) return '#ffc107'; // Жёлтый
    if (mastery === 3) return '#8bc34a'; // Салатовый
    if (mastery === 4) return '#4caf50'; // Зелёный
    return '#2196f3'; // Синий (мастер)
  };

  /**
   * Отображение индикатора мастерства
   */
  const renderMasteryIndicator = (mastery: number) => {
    return (
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <View
            key={i}
            style={{
              width: 8,
              height: 20,
              borderRadius: 2,
              backgroundColor: i < mastery ? getMasteryColor(mastery) : '#e0e0e0',
            }}
          />
        ))}
      </View>
    );
  };

  const masteredCount = lexemes.filter((lx) => lx.mastery >= 4).length;
  const learningCount = lexemes.filter((lx) => lx.mastery > 0 && lx.mastery < 4).length;
  const notStartedCount = lexemes.filter((lx) => lx.mastery === 0).length;

  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 16 }}>
      {/* Заголовок */}
      <View>
        <ThemedText type="title">Словарь</ThemedText>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>{pack.title}</Text>
      </View>

      {/* Статистика */}
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          padding: 12,
          borderRadius: 12,
          backgroundColor: '#f5f5f5',
        }}
      >
        <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#4caf50' }}>{masteredCount}</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>Изучено</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#ff9800' }}>{learningCount}</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>В процессе</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#9e9e9e' }}>{notStartedCount}</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>Не начато</Text>
        </View>
      </View>

      {/* Поиск */}
      <TextInput
        placeholder="Поиск слова..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{
          padding: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#ddd',
          backgroundColor: '#fff',
          fontSize: 16,
          color: '#000',
        }}
        placeholderTextColor="#999"
      />

      {/* Фильтры и сортировка */}
      <View style={{ gap: 8 }}>
        {/* Фильтры */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={() => setFilterMode('all')}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              backgroundColor: filterMode === 'all' ? '#2196f3' : '#f5f5f5',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: filterMode === 'all' ? '#fff' : '#000' }}>
              Все
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilterMode('learning')}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              backgroundColor: filterMode === 'learning' ? '#ff9800' : '#f5f5f5',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: filterMode === 'learning' ? '#fff' : '#000' }}>
              Учу
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilterMode('mastered')}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              backgroundColor: filterMode === 'mastered' ? '#4caf50' : '#f5f5f5',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: filterMode === 'mastered' ? '#fff' : '#000' }}>
              Изучено
            </Text>
          </Pressable>
        </View>

        {/* Сортировка */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={() => setSortMode('alphabet')}
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 8,
              backgroundColor: sortMode === 'alphabet' ? '#e3f2fd' : '#f5f5f5',
              borderWidth: 1,
              borderColor: sortMode === 'alphabet' ? '#2196f3' : '#ddd',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 12, color: '#000' }}>А-Я</Text>
          </Pressable>
          <Pressable
            onPress={() => setSortMode('mastery-asc')}
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 8,
              backgroundColor: sortMode === 'mastery-asc' ? '#e3f2fd' : '#f5f5f5',
              borderWidth: 1,
              borderColor: sortMode === 'mastery-asc' ? '#2196f3' : '#ddd',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 12, color: '#000' }}>↑ Прогресс</Text>
          </Pressable>
          <Pressable
            onPress={() => setSortMode('mastery-desc')}
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 8,
              backgroundColor: sortMode === 'mastery-desc' ? '#e3f2fd' : '#f5f5f5',
              borderWidth: 1,
              borderColor: sortMode === 'mastery-desc' ? '#2196f3' : '#ddd',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 12, color: '#000' }}>↓ Прогресс</Text>
          </Pressable>
        </View>
      </View>

      {/* Список слов */}
      <FlatList
        data={filteredLexemes}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 48 }}>🔍</Text>
            <Text style={{ fontSize: 16, color: '#666', marginTop: 8 }}>Ничего не найдено</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: item.mastery >= 4 ? '#4caf50' : '#ddd',
              gap: 8,
            }}
          >
            {/* Слово и индикатор */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#000', flex: 1 }}>
                {item.base}
              </Text>
              {renderMasteryIndicator(item.mastery)}
            </View>

            {/* Перевод */}
            <Text style={{ fontSize: 16, color: '#000' }}>{item.translation}</Text>

            {/* Недавние ошибки */}
            {item.recentMistakes.length > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Text style={{ fontSize: 12, color: '#f44336' }}>
                  ❌ Ошибок: {item.recentMistakes.length}
                </Text>
              </View>
            )}

            {/* Статус изучения */}
            {item.mastery >= 4 && (
              <View
                style={{
                  alignSelf: 'flex-start',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor: '#e8f5e9',
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#2e7d32' }}>✓ ИЗУЧЕНО</Text>
              </View>
            )}
          </View>
        )}
      />
    </ThemedView>
  );
}
