/**
 * Словарь пака с улучшенной системой мастерства
 */

import { ThemedView } from '@/components/themed-view';
import { getPackById } from '@/lib/content';
import { getPackLexemesWithProgress } from '@/lib/storage';
import { Stack, useLocalSearchParams } from 'expo-router';
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

  useEffect(() => {
    (async () => {
      const data = await getPackLexemesWithProgress(pack);
      setLexemes(data);
      setFilteredLexemes(data);
    })();
  }, [pack]);

  useEffect(() => {
    let result = [...lexemes];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (lx) =>
          lx.base.toLowerCase().includes(query) || lx.translation.toLowerCase().includes(query)
      );
    }

    if (filterMode === 'learning') {
      result = result.filter((lx) => lx.mastery < 4);
    } else if (filterMode === 'mastered') {
      result = result.filter((lx) => lx.mastery >= 4);
    }

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
   * Получение описания уровня мастерства
   */
  const getMasteryLabel = (mastery: number): string => {
    if (mastery === 0) return 'Не изучено';
    if (mastery < 1.5) return 'Начинающий';
    if (mastery < 2.5) return 'Изучаю';
    if (mastery < 3.5) return 'Знаю';
    if (mastery < 4.5) return 'Уверенно';
    return 'Мастер';
  };

  /**
   * Цвет по мастерству
   */
  const getMasteryColor = (mastery: number): string => {
    if (mastery === 0) return '#f44336';
    if (mastery < 1.5) return '#ff9800';
    if (mastery < 2.5) return '#ffc107';
    if (mastery < 3.5) return '#8bc34a';
    if (mastery < 4.5) return '#4caf50';
    return '#2196f3';
  };

  /**
   * Рендер индикатора мастерства с прогресс-баром
   */
  const renderMasteryIndicator = (mastery: number) => {
    const percentage = (mastery / 5) * 100;
    
    return (
      <View style={{ gap: 4, minWidth: 100 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1, height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
            <View
              style={{
                width: `${percentage}%`,
                height: '100%',
                backgroundColor: getMasteryColor(mastery),
                borderRadius: 4,
              }}
            />
          </View>
          <Text style={{ fontSize: 12, fontWeight: '600', color: getMasteryColor(mastery), minWidth: 30 }}>
            {mastery.toFixed(1)}
          </Text>
        </View>
        <Text style={{ fontSize: 10, color: '#666' }}>
          {getMasteryLabel(mastery)}
        </Text>
      </View>
    );
  };

  const masteredCount = lexemes.filter((lx) => lx.mastery >= 4).length;
  const learningCount = lexemes.filter((lx) => lx.mastery > 0 && lx.mastery < 4).length;
  const notStartedCount = lexemes.filter((lx) => lx.mastery === 0).length;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `Словарь: ${pack.title}`,
          headerBackTitle: 'Назад',
        }} 
      />

      <ThemedView style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 16, paddingTop: 8, gap: 16 }}>
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
              <Text style={{ fontSize: 12, color: '#666' }}>Мастер</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#ff9800' }}>{learningCount}</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>Изучаю</Text>
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
                Мастер
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
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: '#fff',
                  borderWidth: 2,
                  borderColor: item.mastery >= 4 ? '#4caf50' : '#ddd',
                  gap: 10,
                }}
              >
                {/* Слово и индикатор мастерства */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>
                      {item.base}
                    </Text>
                    <Text style={{ fontSize: 16, color: '#000', marginTop: 4 }}>{item.translation}</Text>
                  </View>
                  {renderMasteryIndicator(item.mastery)}
                </View>

                {/* Недавние ошибки */}
                {item.recentMistakes.length > 0 && (
                  <View
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      backgroundColor: '#ffebee',
                      borderLeftWidth: 3,
                      borderLeftColor: '#f44336',
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#c62828' }}>
                      ❌ Недавних ошибок: {item.recentMistakes.length}
                    </Text>
                  </View>
                )}

                {/* Бейдж "Мастер" */}
                {item.mastery >= 5 && (
                  <View
                    style={{
                      alignSelf: 'flex-start',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor: '#e3f2fd',
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#1565c0' }}>⭐ МАСТЕР</Text>
                  </View>
                )}
              </View>
            )}
          />
        </View>
      </ThemedView>
    </>
  );
}
