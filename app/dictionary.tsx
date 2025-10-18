/**
 * Словарь пака (с новыми компонентами)
 */

import { DictionaryStats, LexemeCard } from '@/components/dictionary';
import { Container, Text } from '@/components/ui';
import { BORDER_RADIUS, COLORS, SPACING } from '@/constants/design-system';
import { getPackById } from '@/lib/content';
import { getPackLexemesWithProgress } from '@/lib/storage';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';

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

      <Container>
        <View style={{ flex: 1, gap: SPACING.lg }}>
          <DictionaryStats
            masteredCount={masteredCount}
            learningCount={learningCount}
            notStartedCount={notStartedCount}
          />

          <TextInput
            placeholder="Поиск слова..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              padding: SPACING.md,
              borderRadius: BORDER_RADIUS.md,
              borderWidth: 1,
              borderColor: COLORS.gray300,
              backgroundColor: COLORS.white,
              fontSize: 16,
              color: COLORS.gray900,
            }}
            placeholderTextColor={COLORS.gray500}
          />

          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            {(['all', 'learning', 'mastered'] as FilterMode[]).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setFilterMode(mode)}
                style={{
                  flex: 1,
                  padding: SPACING.sm,
                  borderRadius: BORDER_RADIUS.md,
                  backgroundColor: filterMode === mode ? COLORS.primary : COLORS.gray100,
                  alignItems: 'center',
                }}
              >
                <Text
                  variant="caption"
                  weight="semibold"
                  color={filterMode === mode ? 'white' : 'primary'}
                >
                  {mode === 'all' ? 'Все' : mode === 'learning' ? 'Учу' : 'Мастер'}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            {(['alphabet', 'mastery-asc', 'mastery-desc'] as SortMode[]).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setSortMode(mode)}
                style={{
                  flex: 1,
                  padding: SPACING.sm,
                  borderRadius: BORDER_RADIUS.md,
                  backgroundColor: sortMode === mode ? COLORS.infoLight : COLORS.gray100,
                  borderWidth: 1,
                  borderColor: sortMode === mode ? COLORS.primary : COLORS.gray300,
                  alignItems: 'center',
                }}
              >
                <Text variant="caption" color={sortMode === mode ? 'primary' : 'secondary'}>
                  {mode === 'alphabet' ? 'А-Я' : mode === 'mastery-asc' ? '↑' : '↓'}
                </Text>
              </Pressable>
            ))}
          </View>

          <FlatList
            data={filteredLexemes}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
            ListEmptyComponent={
              <View style={{ padding: SPACING.xxxl, alignItems: 'center' }}>
                <Text variant="hero">🔍</Text>
                <Text variant="body" color="secondary" style={{ marginTop: SPACING.sm }}>
                  Ничего не найдено
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <LexemeCard
                base={item.base}
                translation={item.translation}
                mastery={item.mastery}
                recentMistakes={item.recentMistakes}
              />
            )}
          />
        </View>
      </Container>
    </>
  );
}
