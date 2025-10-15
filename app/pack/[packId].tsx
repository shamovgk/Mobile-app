/**
 * Экран выбора уровней с правильными цветами
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getPackById } from '@/lib/content';
import { getLevelProgress, isLevelUnlocked } from '@/lib/storage';
import type { LevelProgress } from '@/lib/types';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function PackDetailsScreen() {
  const { packId } = useLocalSearchParams<{ packId: string }>();
  const router = useRouter();
  const pack = getPackById(packId!)!;

  const [levelProgressMap, setLevelProgressMap] = useState<Record<string, LevelProgress>>({});

  useEffect(() => {
    (async () => {
      const map: Record<string, LevelProgress> = {};
      for (const level of pack.levels) {
        map[level.id] = await getLevelProgress(pack.id, level.id);
      }
      setLevelProgressMap(map);
    })();
  }, [pack]);

  const totalLevels = pack.levels.length;
  const completedLevels = Object.values(levelProgressMap).filter((p) => p?.completed).length;
  const packProgress = totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;
  const isPackCompleted = completedLevels === totalLevels && totalLevels > 0;

  const getBorderColor = (stars: number): string => {
    if (stars === 3) return '#FFD700';
    if (stars === 2) return '#C0C0C0';
    if (stars === 1) return '#CD7F32';
    return '#ddd';
  };

  const getBackgroundColor = (stars: number, unlocked: boolean): string => {
    if (!unlocked) return '#f5f5f5';
    if (stars === 3) return '#fffef5';
    if (stars === 2) return '#fafafa';
    if (stars === 1) return '#fff9f0';
    return '#fff';
  };

  const getDifficultyEmoji = (mode: string): string => {
    if (mode === 'hard') return '🔥';
    if (mode === 'easy') return '🌱';
    return '⚡';
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Заголовок */}
        <View>
          <ThemedText type="title">{pack.title}</ThemedText>
          <Text style={{ marginTop: 4, fontSize: 14, color: '#666' }}>
            CEFR: {pack.cefr} • Слов: {pack.lexemes.length}
          </Text>
        </View>

        {/* Прогресс пака */}
        <View
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: isPackCompleted ? '#fffbea' : '#f5f5f5',
            borderWidth: 2,
            borderColor: isPackCompleted ? '#FFD700' : '#ddd',
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>
              {isPackCompleted ? '🏆 Пак завершён!' : 'Прогресс пака'}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>
              {completedLevels}/{totalLevels}
            </Text>
          </View>

          <View style={{ height: 12, backgroundColor: '#eee', borderRadius: 6, overflow: 'hidden' }}>
            <View
              style={{
                height: '100%',
                width: `${packProgress}%`,
                backgroundColor: isPackCompleted ? '#FFD700' : '#2196f3',
                borderRadius: 6,
              }}
            />
          </View>

          <Text style={{ fontSize: 12, color: '#666' }}>
            {isPackCompleted
              ? '🎉 Все уровни пройдены на 3 звезды!'
              : 'Завершите все уровни на 3★ для получения награды'}
          </Text>
        </View>

        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>Карта уровней</Text>

        {/* Карта уровней */}
        <View style={{ gap: 0 }}>
          {pack.levels.map((level, index) => {
            const progress = levelProgressMap[level.id];
            const stars = progress?.stars ?? 0;
            const unlocked = isLevelUnlocked(pack, level, levelProgressMap);
            const borderColor = unlocked ? getBorderColor(stars) : '#ccc';
            const backgroundColor = getBackgroundColor(stars, unlocked);
            const isNew = unlocked && progress?.attempts === 0;
            const isLastLevel = index === pack.levels.length - 1;

            return (
              <View key={level.id}>
                <Pressable
                  disabled={!unlocked}
                  onPress={() => {
                    if (unlocked) {
                      const levelStr = encodeURIComponent(JSON.stringify(level.config));
                      router.push({
                        pathname: '/run',
                        params: {
                          packId: pack.id,
                          levelId: level.id,
                          level: levelStr,
                          seed: `${pack.id}-${level.id}-${Date.now()}`,
                          mode: 'normal',
                          distractorMode: level.distractorMode,
                        },
                      });
                    }
                  }}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor,
                    backgroundColor,
                    opacity: unlocked ? 1 : 0.5,
                    gap: 10,
                  }}
                >
                  {/* Заголовок уровня */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: unlocked ? borderColor : '#ccc',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 16, fontWeight: '700', color: stars > 0 ? '#000' : '#fff' }}>
                          {level.order}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#000', flex: 1 }}>
                        {level.title}
                      </Text>
                    </View>

                    {!unlocked ? (
                      <Text style={{ fontSize: 24 }}>🔒</Text>
                    ) : isNew ? (
                      <View
                        style={{
                          backgroundColor: '#4caf50',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>NEW</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Описание */}
                  <Text style={{ fontSize: 14, color: '#666', marginLeft: 44 }}>{level.description}</Text>

                  {/* Параметры */}
                  <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginLeft: 44 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 14 }}>⏱️</Text>
                      <Text style={{ fontSize: 12, color: '#000' }}>{level.config.durationSec}с</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 14 }}>❤️</Text>
                      <Text style={{ fontSize: 12, color: '#000' }}>{level.config.lives}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 14 }}>🎯</Text>
                      <Text style={{ fontSize: 12, color: '#000' }}>{level.config.lanes} варианта</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 14 }}>{getDifficultyEmoji(level.distractorMode)}</Text>
                      <Text style={{ fontSize: 12, color: '#000' }}>
                        {level.distractorMode === 'hard'
                          ? 'Сложно'
                          : level.distractorMode === 'easy'
                          ? 'Легко'
                          : 'Нормально'}
                      </Text>
                    </View>
                  </View>

                  {/* Звёзды */}
                  {unlocked && (
                    <View style={{ gap: 6, marginLeft: 44 }}>
                      <View style={{ flexDirection: 'row', gap: 4 }}>
                        {Array.from({ length: 3 }, (_, i) => (
                          <Text key={i} style={{ fontSize: 28, color: i < stars ? '#FFD700' : '#ddd' }}>
                            ★
                          </Text>
                        ))}
                      </View>

                      {progress && progress.attempts > 0 && (
                        <View style={{ gap: 2 }}>
                          <Text style={{ fontSize: 12, color: '#000' }}>
                            🏆 Рекорд: {progress.bestScore} очков ({Math.round(progress.bestAccuracy * 100)}%)
                          </Text>
                          <Text style={{ fontSize: 12, color: '#666' }}>Попыток: {progress.attempts}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Требование разблокировки */}
                  {!unlocked && level.unlockRequirement.previousLevel && (
                    <View
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        backgroundColor: '#fff3cd',
                        borderWidth: 1,
                        borderColor: '#ffc107',
                        marginLeft: 44,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: '#856404' }}>
                        ℹ️ Получите {level.unlockRequirement.minStars}★ на предыдущем уровне
                      </Text>
                    </View>
                  )}
                </Pressable>

                {/* Линия между уровнями */}
                {!isLastLevel && (
                  <View
                    style={{
                      marginLeft: 33,
                      width: 4,
                      height: 16,
                      backgroundColor: unlocked ? borderColor : '#ddd',
                      opacity: 0.5,
                    }}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* Кнопки внизу */}
        <View style={{ gap: 12, marginTop: 8 }}>
          <Link href={{ pathname: '/dictionary', params: { packId: pack.id } }} asChild>
            <Pressable
              style={{
                padding: 14,
                borderRadius: 12,
                backgroundColor: '#2196f3', // ← Синий фон вместо белого
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>
                📖 Словарь пака ({pack.lexemes.length} слов)
              </Text>
            </Pressable>
          </Link>

          <Link href="/" asChild>
            <Pressable
              style={{
                padding: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#ccc',
                alignItems: 'center',
                backgroundColor: '#fff', // ← Белый фон с границей
              }}
            >
              <Text style={{ fontSize: 16, color: '#000' }}>← Назад к пакам</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
