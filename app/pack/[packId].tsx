import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getPackById } from '@/lib/content';
import { getPackAdaptive, getPackProgressSummary, getRecommendedLevelNext } from '@/lib/storage';
import type { LevelConfig } from '@/lib/types';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

const modeLabel: Record<'easy'|'normal'|'hard', string> = {
  easy: 'проще (менее похожие дистракторы)',
  normal: 'нормально',
  hard: 'сложнее (похожие дистракторы)',
};

export default function PackDetailsScreen() {
  const { packId } = useLocalSearchParams<{ packId: string }>();
  const router = useRouter();
  const pack = getPackById(packId!)!;

  const [progress, setProgress] = useState<{ mastered: number; total: number } | null>(null);

  // адаптивная рекомендация уровня + режим дистракторов
  const [recommendedLevel, setRecommendedLevel] = useState<LevelConfig>(pack.levelDefaults);
  const [distractorMode, setDistractorMode] = useState<'easy'|'normal'|'hard'>('normal');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [p, adaptive] = await Promise.all([
        getPackProgressSummary(pack),
        getPackAdaptive(pack.id),
      ]);
      if (!mounted) return;

      setProgress(p);

      const rec = getRecommendedLevelNext(pack.levelDefaults, adaptive);
      setRecommendedLevel(rec.level);
      setDistractorMode(rec.distractorMode);
    })();
    return () => { mounted = false; };
  }, [pack]);

  return (
    <ThemedView style={{ flex: 1, gap: 16, padding: 16 }}>
      <ThemedText type="title">{pack.title}</ThemedText>
      <ThemedText>CEFR: {pack.cefr}</ThemedText>
      <ThemedText>Слов в паке: {pack.lexemes.length}</ThemedText>
      <ThemedText>
        Прогресс: {progress ? `${progress.mastered}/${progress.total}` : '—'}
      </ThemedText>

      <View style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', gap: 6 }}>
        <ThemedText type="defaultSemiBold">Рекомендуемые параметры</ThemedText>
        <ThemedText>Длительность: {recommendedLevel.durationSec}s</ThemedText>
        <ThemedText>Развилка каждые: {recommendedLevel.forkEverySec}s</ThemedText>
        <ThemedText>Дорожки: {recommendedLevel.lanes}</ThemedText>
        <ThemedText>Жизни: {recommendedLevel.lives}</ThemedText>
        <ThemedText>Дистракторы: {modeLabel[distractorMode]}</ThemedText>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          const levelStr = encodeURIComponent(JSON.stringify(recommendedLevel));
          router.push({
            pathname: '/run',
            params: {
              packId: pack.id,
              level: levelStr,
              seed: `${pack.id}-seed-demo`,
              mode: 'normal',
              distractorMode,
            },
          });
        }}
        style={{ padding: 16, borderRadius: 12, backgroundColor: '#2f80ed', alignItems: 'center' }}
      >
        <ThemedText style={{ color: 'white' }}>Играть</ThemedText>
      </Pressable>

      {/* 🔹 Передаём packId в словарь */}
      <Link href={{ pathname: '/dictionary', params: { packId: pack.id } }} asChild>
        <Pressable style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' }}>
          <ThemedText>Словарь пака</ThemedText>
        </Pressable>
      </Link>
    </ThemedView>
  );
}
