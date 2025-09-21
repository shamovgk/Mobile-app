import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getPackById } from '@/lib/content';
import { applySessionSummary } from '@/lib/storage';
import type { RunSummary } from '@/lib/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

export default function ResultScreen() {
  const { summary } = useLocalSearchParams<{ summary?: string }>();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  let data: RunSummary | null = null;
  try {
    data = summary ? (JSON.parse(decodeURIComponent(summary)) as RunSummary) : null;
  } catch {
    data = null;
  }

  const packId = data?.packId ?? 'pack-basic-1';
  const pack = getPackById(packId)!;
  const levelStr = data ? encodeURIComponent(JSON.stringify(data.level)) : undefined;

  // Сохраняем прогресс/историю один раз
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (data && !saved) {
        await applySessionSummary(pack, data);
        if (mounted) setSaved(true);
      }
    })();
    return () => { mounted = false; };
  }, [data, pack, saved]);

  return (
    <ThemedView style={{ flex: 1, gap: 16, padding: 16 }}>
      <ThemedText type="title">Итоги</ThemedText>
      <View style={{ gap: 4 }}>
        <ThemedText>Очки: {data?.score ?? 0}</ThemedText>
        <ThemedText>Точность: {Math.round((data?.accuracy ?? 0) * 100)}%</ThemedText>
        <ThemedText>Ошибок: {data?.errors?.length ?? 0}</ThemedText>
        <ThemedText>{saved ? 'Прогресс сохранён офлайн' : 'Сохраняем...'}</ThemedText>
      </View>

      <View style={{ gap: 8 }}>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: '/run',
              params: {
                packId,
                level: levelStr!,
                seed: data?.seed ?? 'seed',
                mode: 'review',
              },
            })
          }
          style={{ padding: 16, borderRadius: 12, backgroundColor: '#f2994a', alignItems: 'center' }}
        >
          <ThemedText style={{ color: 'white' }}>Повторить ошибки</ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: '/run',
              params: {
                packId,
                level: levelStr!,
                seed: `${packId}-seed-retry`,
                mode: 'normal',
              },
            })
          }
          style={{ padding: 16, borderRadius: 12, backgroundColor: '#2f80ed', alignItems: 'center' }}
        >
          <ThemedText style={{ color: 'white' }}>Играть снова</ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/pack/[packId]', params: { packId } })}
          style={{ padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' }}
        >
          <ThemedText>К паку</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}
