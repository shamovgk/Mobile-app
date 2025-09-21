import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FlatList, View } from 'react-native';

const demoWords = [
  { id: 'w1', base: 'example', translation: 'пример', mastery: 2 },
  { id: 'w2', base: 'apple', translation: 'яблоко', mastery: 4 },
  { id: 'w3', base: 'book', translation: 'книга', mastery: 1 },
];

export default function DictionaryScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 16 }}>
      <ThemedText type="title">Словарь</ThemedText>
      <FlatList
        data={demoWords}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ddd' }}>
            <ThemedText type="defaultSemiBold">{item.base}</ThemedText>
            <ThemedText>Перевод: {item.translation}</ThemedText>
            <ThemedText>Мастерство: {item.mastery}/5</ThemedText>
          </View>
        )}
      />
    </ThemedView>
  );
}
