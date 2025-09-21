import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { packsMeta } from '@/data/packs';
import type { LevelConfig } from '@/lib/types';
import { Link, useRouter } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  const defaultLevel: LevelConfig = {
    durationSec: 60,
    forkEverySec: 2.5,
    lanes: 2,
    allowedTypes: ['meaning'],
    lives: 3,
  };

  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ThemedText type="title">Словарный Раннер</ThemedText>
        <Link href="/settings" asChild>
          <Pressable accessibilityRole="button" style={{ padding: 8 }}>
            <ThemedText>⚙️</ThemedText>
          </Pressable>
        </Link>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          const pack = packsMeta[0];
          router.push({
            pathname: '/pack/[packId]',
            params: { packId: pack.id },
          });
        }}
        style={{
          padding: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#ccc',
        }}
      >
        <ThemedText type="defaultSemiBold">Быстрый старт</ThemedText>
        <ThemedText>Последний пак: {packsMeta[0]?.title}</ThemedText>
      </Pressable>

      <ThemedText type="subtitle">Паки</ThemedText>
      <FlatList
        data={packsMeta}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/pack/[packId]', params: { packId: item.id } })}
            style={{
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#ddd',
            }}
          >
            <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
            <ThemedText>CEFR: {item.cefr} • Слов: {item.lexemeCount}</ThemedText>
            <ThemedText>Прогресс: {item.progress?.mastered ?? 0}/{item.progress?.total ?? item.lexemeCount}</ThemedText>
          </Pressable>
        )}
      />

      <Link href="/dictionary" asChild>
        <Pressable
          style={{
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#ccc',
            alignItems: 'center',
          }}
        >
          <ThemedText>Открыть словарь</ThemedText>
        </Pressable>
      </Link>
    </ThemedView>
  );
}
