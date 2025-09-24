import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getPackById, getPacks } from '@/lib/content';
import { getPackLexemesWithProgress } from '@/lib/storage';
import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

export default function DictionaryScreen() {
  const { packId } = useLocalSearchParams<{ packId?: string }>();

  // если packId не передали (прямой заход), берём первый пак
  const pack = useMemo(() => {
    if (packId) return getPackById(packId) ?? getPacks()[0];
    return getPacks()[0];
  }, [packId]);

  const [items, setItems] = useState<Awaited<ReturnType<typeof getPackLexemesWithProgress>>>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!pack) return;
      const list = await getPackLexemesWithProgress(pack);
      if (mounted) setItems(list);
    })();
    return () => { mounted = false; };
  }, [pack]);

  if (!pack) {
    return (
      <ThemedView style={{ flex: 1, padding: 16, gap: 16 }}>
        <ThemedText type="title">Словарь</ThemedText>
        <ThemedText>Пак не найден.</ThemedText>
        <Link href="/" asChild>
          <Pressable style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' }}>
            <ThemedText>На главную</ThemedText>
          </Pressable>
        </Link>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 16 }}>
      <ThemedText type="title">Словарь — {pack.title}</ThemedText>
      <ThemedText style={{ opacity: 0.7 }}>Всего слов: {pack.lexemes.length}</ThemedText>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ddd' }}>
            <ThemedText type="defaultSemiBold">{item.base}</ThemedText>
            <ThemedText>Перевод: {item.translation}</ThemedText>
            <ThemedText>Мастерство: {item.mastery}/5</ThemedText>
            {item.recentMistakes.length > 0 && (
              <ThemedText>Ошибки: {item.recentMistakes.length} (последние)</ThemedText>
            )}
          </View>
        )}
        ListFooterComponent={<View style={{ height: 12 }} />}
      />

      {/* Навигация назад в пак */}
      <Link href={{ pathname: '/pack/[packId]', params: { packId: pack.id } }} asChild>
        <Pressable style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' }}>
          <ThemedText>К паку</ThemedText>
        </Pressable>
      </Link>
    </ThemedView>
  );
}
