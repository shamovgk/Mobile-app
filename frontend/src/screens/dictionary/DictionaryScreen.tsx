import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { useQuery } from '@tanstack/react-query';
import { dictionaryApi } from '@/lib/api/services/dictionary.service';
import { Input } from '@/components/ui/Input/Input';
import { MASTERY_COLORS, MASTERY_LABELS } from '@/lib/utils';

interface LexemeItem {
  id: string;
  form: string;
  meaning: string;
  mastery: number;
  lastReviewed: string | null;
}

export const DictionaryScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);

  const { data: lexemes, isLoading } = useQuery({
    queryKey: ['dictionary', selectedPackId],
    queryFn: () => selectedPackId ? dictionaryApi.getPackDictionary(selectedPackId) : null,
    enabled: !!selectedPackId,
  });

  const filteredLexemes = lexemes?.filter((lexeme: LexemeItem) =>
    lexeme.form.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lexeme.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMasteryColor = (mastery: number) => {
    const colors_map: Record<number, string> = {
      0: MASTERY_COLORS.NONE,
      1: MASTERY_COLORS.BEGINNER,
      2: MASTERY_COLORS.LEARNING,
      3: MASTERY_COLORS.KNOWS,
      4: MASTERY_COLORS.CONFIDENT,
      5: MASTERY_COLORS.MASTER,
    };
    return colors_map[mastery] || MASTERY_COLORS.NONE;
  };

  const renderLexemeCard = ({ item }: { item: LexemeItem }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.form}>{item.form}</Text>
        <View 
          style={[
            styles.masteryBadge, 
            { backgroundColor: getMasteryColor(item.mastery) }
          ]}
        >
          <Text style={styles.masteryText}>{MASTERY_LABELS[item.mastery]}</Text>
        </View>
      </View>
      <Text style={styles.meaning}>{item.meaning}</Text>
      {item.lastReviewed && (
        <Text style={styles.lastReviewed}>
          Последнее повторение: {new Date(item.lastReviewed).toLocaleDateString()}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Словарь</Text>
        <Input
          placeholder="Поиск слов..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredLexemes}
          renderItem={renderLexemeCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Слова не найдены</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    gap: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily.black,
    fontSize: typography.fontSize.xxl,
    color: colors.text.primary,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.background.paper,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  form: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
  },
  masteryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  masteryText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
  },
  meaning: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  lastReviewed: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    opacity: 0.7,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
});
