import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { packsMeta } from '@/data/packs';
import { getPackById } from '@/lib/content';
import { getPackProgressSummary } from '@/lib/storage';
import { useFocusEffect } from '@react-navigation/native';
import { Link } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ProgressMap = Record<
  string,
  { mastered: number; total: number; completedLevels: number; totalLevels: number }
>;

export default function HomeScreen() {
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

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        await loadProgress();
      })();
      return () => {
        mounted = false;
      };
    }, [loadProgress])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadProgress();
    } finally {
      setRefreshing(false);
    }
  }, [loadProgress]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'left', 'right']}>
      <ThemedView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
        {/* Заголовок с кнопкой настроек */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <ThemedText type="title">Word Rush</ThemedText>
          <Link href="/settings" asChild>
            <Pressable accessibilityRole="button" style={{ padding: 8 }}>
              <Text style={{ fontSize: 24 }}>⚙️</Text>
            </Pressable>
          </Link>
        </View>

        {/* Быстрый старт */}
        {packsMeta.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Link href={{ pathname: '/pack/[packId]', params: { packId: packsMeta[0].id } }} asChild>
              <Pressable
                style={{
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: '#e3f2fd',
                  borderWidth: 2,
                  borderColor: '#2196f3',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>🚀 Быстрый старт</Text>
                <Text style={{ marginTop: 4, fontSize: 14, color: '#000' }}>{packsMeta[0]?.title}</Text>
              </Pressable>
            </Link>
          </View>
        )}

        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 12 }}>Паки</Text>

        {/* Список паков */}
        <FlatList
          data={packsMeta}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const p = progress[item.id];
            const wordsProgress = p && p.total > 0 ? (p.mastered / p.total) * 100 : 0;
            const levelsProgress = p && p.totalLevels > 0 ? (p.completedLevels / p.totalLevels) * 100 : 0;
            const isPackCompleted = levelsProgress === 100;

            return (
              <Link href={{ pathname: '/pack/[packId]', params: { packId: item.id } }} asChild>
                <Pressable
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: isPackCompleted ? '#FFD700' : '#ddd',
                    backgroundColor: isPackCompleted ? '#fffbea' : '#fff',
                    gap: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#000', flex: 1 }}>
                      {item.title}
                    </Text>
                    {isPackCompleted && (
                      <View
                        style={{
                          backgroundColor: '#FFD700',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#000' }}>✓ Завершён</Text>
                      </View>
                    )}
                  </View>

                  <Text style={{ fontSize: 14, color: '#666' }}>
                    CEFR: {item.cefr} • Слов: {item.lexemeCount} • Уровней: {item.levelsCount}
                  </Text>

                  <View style={{ gap: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: '#000' }}>Изучено слов</Text>
                      <Text style={{ fontSize: 12, color: '#000' }}>
                        {p ? `${p.mastered}/${p.total}` : '0/0'}
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 6,
                        backgroundColor: '#eee',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          height: '100%',
                          width: `${wordsProgress}%`,
                          backgroundColor: '#4caf50',
                          borderRadius: 3,
                        }}
                      />
                    </View>
                  </View>

                  <View style={{ gap: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: '#000' }}>Пройдено уровней (3★)</Text>
                      <Text style={{ fontSize: 12, color: '#000' }}>
                        {p ? `${p.completedLevels}/${p.totalLevels}` : '0/0'}
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 6,
                        backgroundColor: '#eee',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          height: '100%',
                          width: `${levelsProgress}%`,
                          backgroundColor: levelsProgress === 100 ? '#FFD700' : '#2196f3',
                          borderRadius: 3,
                        }}
                      />
                    </View>
                  </View>
                </Pressable>
              </Link>
            );
          }}
        />
      </ThemedView>
    </SafeAreaView>
  );
}
