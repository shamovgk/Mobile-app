/**
 * Экран результатов с полным сбросом стека навигации
 */

import { Confetti } from '@/components/confetti';
import { ThemedView } from '@/components/themed-view';
import { getPackById } from '@/lib/content';
import { applySessionSummary, getLevelProgress } from '@/lib/storage';
import type { RunSummary } from '@/lib/types';
import { CommonActions } from '@react-navigation/native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { BackHandler, Pressable, ScrollView, Text, View } from 'react-native';

export default function ResultScreen() {
  const { summary } = useLocalSearchParams<{ summary?: string }>();
  const router = useRouter();
  const navigation = useNavigation();

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  /**
   * Блокировка аппаратной кнопки "Назад"
   */
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });

    return () => backHandler.remove();
  }, []);

  let data: RunSummary | null = null;
  try {
    data = summary ? (JSON.parse(decodeURIComponent(summary)) as RunSummary) : null;
  } catch {
    data = null;
  }

  const packId = data?.packId ?? 'pack-food-1';
  const levelId = data?.levelId ?? 'level-1';
  const pack = getPackById(packId)!;
  const currentLevel = pack.levels.find((l) => l.id === levelId);
  const currentLevelIndex = pack.levels.findIndex((l) => l.id === levelId);
  const nextLevel =
    currentLevelIndex >= 0 && currentLevelIndex < pack.levels.length - 1
      ? pack.levels[currentLevelIndex + 1]
      : null;

  const levelStr = data ? encodeURIComponent(JSON.stringify(data.level)) : undefined;
  const [nextLevelUnlocked, setNextLevelUnlocked] = useState(false);
  const accuracyPct = Math.round((data?.accuracy ?? 0) * 100);

  const getStars = (accuracy: number): number => {
    if (accuracy >= 0.95) return 3;
    if (accuracy >= 0.85) return 2;
    if (accuracy >= 0.70) return 1;
    return 0;
  };

  const stars = getStars(data?.accuracy ?? 0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (data && !saved) {
        try {
          await applySessionSummary(pack, data);
          if (mounted) {
            setSaved(true);
            setSaveError(null);

            if (stars === 3) {
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 3000);
            }

            if (nextLevel) {
              const currentProgress = await getLevelProgress(pack.id, levelId);
              const unlocked = currentProgress.stars >= 1;
              setNextLevelUnlocked(unlocked);
            }
          }
        } catch (e: any) {
          if (mounted) {
            setSaved(false);
            setSaveError(String(e?.message ?? ''));
          }
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [data, pack, saved, levelId, nextLevel, stars]);

  const errorItems = useMemo(() => {
    if (!data) return [];

    const errorSet = new Set((data.errors ?? []).map((e) => e.lexemeId));
    const attemptsMap = new Map<string, number>();

    if (data.answers && data.answers.length > 0) {
      for (const a of data.answers) {
        const prev = attemptsMap.get(a.lexemeId) ?? 0;
        attemptsMap.set(a.lexemeId, Math.max(prev, a.attempts));
      }
    }

    return Array.from(errorSet).map((lexemeId) => {
      const lx = pack.lexemes.find((l) => l.id === lexemeId);
      return {
        lexemeId,
        base: lx?.base ?? lexemeId,
        translation: lx?.translations?.[0] ?? '',
        example: lx?.examples?.[0] ?? '',
        attempts: attemptsMap.get(lexemeId) ?? 1,
      };
    });
  }, [data, pack]);

  const repeatSet = errorItems.map((i) => i.lexemeId);
  const repeatParam = repeatSet.length > 0 ? encodeURIComponent(JSON.stringify(repeatSet)) : undefined;

  /**
   * КЛЮЧЕВАЯ ФУНКЦИЯ: Сброс стека навигации до пака
   * Удаляет все экраны игры и результатов, оставляя только: index → pack
   */
  const resetToPack = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 1, // Будет 2 экрана в стеке
        routes: [
          { name: 'index' }, // Главная
          { 
            name: 'pack/[packId]', 
            params: { packId } 
          }, // Пак
        ],
      })
    );
  };

  /**
   * Переход к игре через пак (очищаем стек)
   */
  const navigateToGame = (gameParams: any) => {
    // Сначала сбрасываем стек до пака
    resetToPack();
    
    // Потом открываем игру
    setTimeout(() => {
      router.push({
        pathname: '/run',
        params: gameParams,
      });
    }, 100);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      {showConfetti && <Confetti count={60} duration={3000} />}

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 16 }}>
        {/* Информация об уровне */}
        {currentLevel && (
          <View
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: stars === 3 ? '#fffbea' : '#f5f5f5',
              borderWidth: 1,
              borderColor: stars === 3 ? '#FFD700' : '#ddd',
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>{currentLevel.title}</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>{currentLevel.description}</Text>
          </View>
        )}

        {/* Статистика */}
        <View
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: '#ddd',
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>Статистика</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: '#000' }}>Очки</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#000' }}>{data?.score ?? 0}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: '#000' }}>Точность</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#000' }}>{accuracyPct}%</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: '#000' }}>Длительность</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#000' }}>
              {Math.max(0, Math.round(data?.durationPlayedSec ?? 0))}с
            </Text>
          </View>
          {!!data?.timeBonus && data.timeBonus > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: '#000' }}>⚡ Бонус за время</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#4caf50' }}>+{data.timeBonus}</Text>
            </View>
          )}
        </View>

        {/* Звёзды */}
        <View
          style={{
            padding: 20,
            borderRadius: 12,
            backgroundColor: stars === 3 ? '#fffbea' : stars >= 1 ? '#f0f8ff' : '#fff',
            borderWidth: 2,
            borderColor: stars === 3 ? '#FFD700' : stars === 2 ? '#C0C0C0' : stars === 1 ? '#CD7F32' : '#ddd',
            gap: 12,
          }}
        >
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
            {Array.from({ length: 3 }, (_, i) => (
              <Text key={i} style={{ fontSize: 48, color: i < stars ? '#FFD700' : '#ddd' }}>
                ★
              </Text>
            ))}
          </View>

          {stars === 3 && (
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 32 }}>🎉</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', textAlign: 'center', color: '#000' }}>
                Идеально! Уровень завершён на 3 звезды!
              </Text>
            </View>
          )}
          {stars === 2 && (
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 28 }}>✨</Text>
              <Text style={{ fontSize: 14, textAlign: 'center', color: '#000' }}>
                Отлично! Попробуйте ещё раз для 3 звёзд.
              </Text>
            </View>
          )}
          {stars === 1 && (
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 28 }}>💪</Text>
              <Text style={{ fontSize: 14, textAlign: 'center', color: '#000' }}>
                Хороший старт! Можно лучше для большего количества звёзд.
              </Text>
            </View>
          )}
          {stars === 0 && (
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 28 }}>😔</Text>
              <Text style={{ fontSize: 14, textAlign: 'center', color: '#000' }}>
                Нужно больше 70% для получения звёзд. Попробуйте ещё раз!
              </Text>
            </View>
          )}

          {nextLevel && stars >= 1 && nextLevelUnlocked && (
            <View
              style={{
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#e8f5e9',
                borderWidth: 1,
                borderColor: '#4caf50',
                marginTop: 8,
              }}
            >
              <Text style={{ fontWeight: '600', textAlign: 'center', color: '#2e7d32' }}>
                🎉 Следующий уровень разблокирован!
              </Text>
              <Text style={{ fontSize: 12, marginTop: 4, textAlign: 'center', color: '#2e7d32' }}>
                {nextLevel.title}
              </Text>
            </View>
          )}
        </View>

        {/* Ошибки */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>
            Ошибки {errorItems.length > 0 && `(${errorItems.length})`}
          </Text>

          {errorItems.length === 0 ? (
            <View
              style={{
                padding: 32,
                borderRadius: 12,
                backgroundColor: '#f0f8ff',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 56 }}>🎯</Text>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>Безупречно!</Text>
              <Text style={{ fontSize: 14, color: '#666' }}>Ни одной ошибки</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {errorItems.map((item) => (
                <View
                  key={item.lexemeId}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderLeftWidth: 6,
                    borderLeftColor: '#f44336',
                    borderColor: '#ffcdd2',
                    backgroundColor: '#fff',
                    gap: 8,
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#000' }}>
                    {String(item.base)}
                  </Text>

                  <Text style={{ fontSize: 16, color: '#000' }}>{item.translation}</Text>

                  {!!item.example && (
                    <View
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        backgroundColor: '#f5f5f5',
                        borderLeftWidth: 3,
                        borderLeftColor: '#2196f3',
                      }}
                    >
                      <Text style={{ fontSize: 13, fontStyle: 'italic', color: '#666' }}>
                        {item.example}
                      </Text>
                    </View>
                  )}

                  {item.attempts > 1 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 12, color: '#f44336', fontWeight: '600' }}>
                        ❌ Попыток: {item.attempts}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Кнопки действий */}
        <View style={{ gap: 10, marginTop: 8 }}>
          {/* Следующий уровень */}
          {nextLevel && stars >= 1 && nextLevelUnlocked && (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                const nextLevelStr = encodeURIComponent(JSON.stringify(nextLevel.config));
                navigateToGame({
                  packId,
                  levelId: nextLevel.id,
                  level: nextLevelStr,
                  seed: `${packId}-${nextLevel.id}-${Date.now()}`,
                  mode: 'normal',
                  distractorMode: nextLevel.distractorMode,
                });
              }}
              style={{
                padding: 16,
                borderRadius: 12,
                backgroundColor: '#4caf50',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 20 }}>▶️</Text>
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Следующий уровень</Text>
            </Pressable>
          )}

          {/* Повторить ошибки */}
          {repeatSet.length > 0 && currentLevel && (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                navigateToGame({
                  packId,
                  levelId,
                  level: levelStr!,
                  seed: `${packId}-${levelId}-review-${Date.now()}`,
                  mode: 'review',
                  repeat: repeatParam!,
                  distractorMode: currentLevel.distractorMode,
                });
              }}
              style={{ padding: 16, borderRadius: 12, backgroundColor: '#ff9800', alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                🔁 Повторить ошибки ({repeatSet.length})
              </Text>
            </Pressable>
          )}

          {/* Повторить уровень */}
          {currentLevel && (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                navigateToGame({
                  packId,
                  levelId,
                  level: levelStr!,
                  seed: `${packId}-${levelId}-retry-${Date.now()}`,
                  mode: 'normal',
                  distractorMode: currentLevel.distractorMode,
                });
              }}
              style={{ padding: 16, borderRadius: 12, backgroundColor: '#2196f3', alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>🔄 Повторить уровень</Text>
            </Pressable>
          )}

          {/* Назад к уровням - ИСПОЛЬЗУЕМ resetToPack */}
          <Pressable
            accessibilityRole="button"
            onPress={resetToPack}
            style={{
              padding: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: '#2196f3',
              backgroundColor: '#fff',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, color: '#2196f3', fontWeight: '600' }}>← Назад к уровням</Text>
          </Pressable>
        </View>

        {/* Индикатор сохранения */}
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>
            {saved ? '✓ Прогресс сохранён' : saveError ? `❌ Ошибка: ${saveError}` : '💾 Сохранение...'}
          </Text>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
