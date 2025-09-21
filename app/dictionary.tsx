import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getPackById } from '@/lib/content';
import { getPackLexemesWithProgress } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';

export default function DictionaryScreen() {
  const pack = getPackById('pack-basic-1')!; // один пак в MVP
  const [items, setItems] = useState<Awaited<ReturnType<typeof getPackLexemesWithProgress>>>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const list = await getPackLexemesWithProgress(pack);
      if (mounted) setItems(list);
    })();
    return () => { mounted = false; };
  }, [pack]);

  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 16 }}>
      <ThemedText type="title">Словарь</ThemedText>
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
      />
    </ThemedView>
  );
}
