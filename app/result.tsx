import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getPackById } from '@/lib/content';
import { applySessionSummary } from '@/lib/storage';
import type { RunSummary } from '@/lib/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

export default function ResultScreen() {
  const { summary } = useLocalSearchParams<{ summary?: string }>();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
        try {
          await applySessionSummary(pack, data);
          if (mounted) { setSaved(true); setSaveError(null); }
        } catch (e: any) {
          if (mounted) { setSaved(false); setSaveError(String(e?.message ?? 'Ошибка сохранения')); }
        }
      }
    })();
    return () => { mounted = false; };
  }, [data, pack, saved]);

  // Мэп ошибок для карточек: уникальные lexemeId + attempts из answers (макс по слову)
  const errorItems = useMemo(() => {
    if (!data) return [];
    const errorSet = new Set((data.errors ?? []).map(e => e.lexemeId));
    const attemptsMap = new Map<string, number>();
    if (data.answers && data.answers.length > 0) {
      for (const a of data.answers) {
        const prev = attemptsMap.get(a.lexemeId) ?? 0;
        attemptsMap.set(a.lexemeId, Math.max(prev, a.attempts));
      }
    }
    return Array.from(errorSet).map(lexemeId => {
      const lx = pack.lexemes.find(l => l.id === lexemeId);
      return {
        lexemeId,
        base: lx?.base ?? lexemeId,
        translation: lx?.translations?.[0] ?? '—',
        example: lx?.examples?.[0] ?? '',
        attempts: attemptsMap.get(lexemeId) ?? 1,
      };
    });
  }, [data, pack]);

  // repeatSet — список lexemeId для повтора
  const repeatSet = useMemo(() => errorItems.map(i => i.lexemeId), [errorItems]);
  const repeatParam = repeatSet.length > 0 ? encodeURIComponent(JSON.stringify(repeatSet)) : undefined;

  const accuracyPct = Math.round((data?.accuracy ?? 0) * 100);

  return (
    <ThemedView style={{ flex: 1, gap: 16, padding: 16 }}>
      <ThemedText type="title">Итоги</ThemedText>

      <View style={{ gap: 4 }}>
        <ThemedText>Очки: {data?.score ?? 0}</ThemedText>
        <ThemedText>Точность: {accuracyPct}%</ThemedText>
        <ThemedText>Длительность: {Math.max(0, Math.round(data?.durationPlayedSec ?? 0))} c</ThemedText>
        {!!data?.timeBonus && data.timeBonus > 0 && (
          <ThemedText>Бонус за ранний финиш: +{data.timeBonus}</ThemedText>
        )}
        <ThemedText>{saved ? 'Прогресс сохранён офлайн' : (saveError ? `Не сохранили: ${saveError}` : 'Сохраняем...')}</ThemedText>
      </View>

      {/* Ошибки */}
      <View style={{ gap: 8 }}>
        <ThemedText type="defaultSemiBold">Ошибки</ThemedText>
        {errorItems.length === 0 ? (
          <ThemedText>В этой сессии нет ошибок 🎉</ThemedText>
        ) : (
          <FlatList
            data={errorItems}
            keyExtractor={(i) => i.lexemeId}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <View style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', gap: 4 }}>
                <ThemedText type="defaultSemiBold">{item.base}</ThemedText>
                <ThemedText>Правильный перевод: {item.translation}</ThemedText>
                {!!item.example && <ThemedText style={{ opacity: 0.8 }}>Пример: {item.example}</ThemedText>}
                {item.attempts > 1 && <ThemedText>Попыток: {item.attempts}</ThemedText>}
              </View>
            )}
          />
        )}
      </View>

      <View style={{ gap: 8 }}>
        {/* Быстрый повтор / Похожее посложнее */}
        {repeatSet.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: '/run',
                params: {
                  packId,
                  level: levelStr!,
                  seed: `${packId}-review-${Date.now()}`,
                  mode: 'review',
                  repeat: repeatParam!,
                },
              })
            }
            style={{ padding: 16, borderRadius: 12, backgroundColor: '#f2994a', alignItems: 'center' }}
          >
            <ThemedText style={{ color: 'white' }}>Быстрый повтор (ошибки)</ThemedText>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: '/run',
                params: {
                  packId,
                  level: levelStr!,
                  seed: `${packId}-harder-${Date.now()}`,
                  mode: 'review',
                  // простая эвристика: берём слова с низким мастерством (эмуляция — пустой repeat, run сам использует обычный план)
                },
              })
            }
            style={{ padding: 16, borderRadius: 12, backgroundColor: '#6c5ce7', alignItems: 'center' }}
          >
            <ThemedText style={{ color: 'white' }}>Похожее посложнее</ThemedText>
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: '/run',
              params: {
                packId,
                level: levelStr!,
                seed: `${packId}-seed-retry-${Date.now()}`,
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

        {saveError && (
          <Pressable
            accessibilityRole="button"
            onPress={async () => {
              try {
                if (data) await applySessionSummary(pack, data);
                setSaveError(null);
                setSaved(true);
              } catch (e: any) {
                setSaveError(String(e?.message ?? 'Ошибка сохранения'));
                setSaved(false);
              }
            }}
            style={{ padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#f2c94c', alignItems: 'center' }}
          >
            <ThemedText>Повторить сохранение</ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}
