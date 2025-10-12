import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { packsMeta } from '@/data/packs';
import { getPackById } from '@/lib/content';
import { getPackProgressSummary } from '@/lib/storage';
import type { LevelConfig } from '@/lib/types';
import { useFocusEffect } from '@react-navigation/native';
import { Link, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';

type ProgressMap = Record<string, { mastered: number; total: number }>;

export default function HomeScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressMap>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadProgress = useCallback(async () => {
    const map: ProgressMap = {};
    for (const m of packsMeta) {
      const pack = getPackById(m.id)!;
      map[m.id] = await getPackProgressSummary(pack);
    }
    setProgress(map);
  }, []);

  // 1) Подгружаем прогресс каждый раз при фокусе Home
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        await loadProgress();
      })();
      return () => { mounted = false; };
    }, [loadProgress])
  );

  // 2) Pull-to-refresh (опционально)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadProgress();
    } finally {
      setRefreshing(false);
    }
  }, [loadProgress]);

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
        <ThemedText type="title">Word Rush</ThemedText>
        <Link href="/settings" asChild>
          <Pressable accessibilityRole="button" style={{ padding: 8 }}>
            <ThemedText>⚙️</ThemedText>
          </Pressable>
        </Link>
      </View>

      <Link
        href={{ pathname: '/pack/[packId]', params: { packId: packsMeta[0].id } }}
        asChild
      >
        <Pressable style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ccc' }}>
          <ThemedText type="defaultSemiBold">Быстрый старт</ThemedText>
          <ThemedText>Последний пак: {packsMeta[0]?.title}</ThemedText>
        </Pressable>
      </Link>

      <ThemedText type="subtitle">Паки</ThemedText>
      <FlatList
        data={packsMeta}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const p = progress[item.id];
          return (
            <Link
              href={{ pathname: '/pack/[packId]', params: { packId: item.id } }}
              asChild
            >
              <Pressable style={{ padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#ddd' }}>
                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                <ThemedText>CEFR: {item.cefr} • Слов: {item.lexemeCount}</ThemedText>
                <ThemedText>
                  Прогресс: {p ? `${p.mastered}/${p.total}` : '—'}
                </ThemedText>
              </Pressable>
            </Link>
          );
        }}
      />
    </ThemedView>
  );
}
