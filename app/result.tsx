/**
 * Экран результатов (РЕФАКТОРИНГ С РЕЖИМАМИ)
 */

import { Confetti } from '@/components/confetti';
import { ActionButtons, ErrorList, StarsDisplay, StatsCard } from '@/components/result';
import { Container } from '@/components/ui';
import { getPackById } from '@/lib/content';
import { applySessionSummary, getLevelProgress } from '@/lib/storage';
import type { RunSummary } from '@/lib/types';
import { CommonActions } from '@react-navigation/native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { BackHandler, ScrollView, Text, View } from 'react-native';

export default function ResultScreen() {
  const { summary } = useLocalSearchParams<{ summary?: string }>();
  const router = useRouter();
  const navigation = useNavigation();

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [nextLevelUnlocked, setNextLevelUnlocked] = useState(false);

  // Блокировка кнопки "Назад"
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  // Парсинг данных
  const data: RunSummary | null = useMemo(() => {
    try {
      return summary ? (JSON.parse(decodeURIComponent(summary)) as RunSummary) : null;
    } catch {
      return null;
    }
  }, [summary]);

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
  const gameMode = data?.gameMode ?? 'lives';
  const stars = (data?.stars ?? 0) as 0 | 1 | 2 | 3;

  // Список ошибок
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

  // Сохранение прогресса
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

  // Навигация
  const resetToPack = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'index' },
          { name: 'pack/[packId]', params: { packId } },
        ],
      })
    );
  };

  const navigateToGame = (gameParams: any) => {
    resetToPack();
    setTimeout(() => {
      router.push({ pathname: '/game/run', params: gameParams });
    }, 100);
  };

  const handleNextLevel = () => {
    if (!nextLevel) return;
    const nextLevelStr = encodeURIComponent(JSON.stringify(nextLevel.config));
    navigateToGame({
      packId,
      levelId: nextLevel.id,
      level: nextLevelStr,
      seed: `${packId}-${nextLevel.id}-${Date.now()}`,
      mode: 'normal',
      distractorMode: nextLevel.distractorMode,
    });
  };

  const handleRetryErrors = () => {
    if (!currentLevel) return;
    navigateToGame({
      packId,
      levelId,
      level: levelStr!,
      seed: `${packId}-${levelId}-review-${Date.now()}`,
      mode: 'review',
      repeat: repeatParam!,
      distractorMode: currentLevel.distractorMode,
    });
  };

  const handleRetryLevel = () => {
    if (!currentLevel) return;
    navigateToGame({
      packId,
      levelId,
      level: levelStr!,
      seed: `${packId}-${levelId}-retry-${Date.now()}`,
      mode: 'normal',
      distractorMode: currentLevel.distractorMode,
    });
  };

  return (
    <Container>
      {showConfetti && <Confetti count={60} duration={3000} />}
    
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 16 }}>
        {/* Информация об уровне с режимом */}
        {currentLevel && (
          <View
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: stars === 3 ? '#fffbea' : '#f5f5f5',
              borderWidth: 2,
              borderColor: stars === 3 ? '#FFD700' : gameMode === 'lives' ? '#FF5252' : '#2196F3',
              gap: 8,
            }}
          >
            {/* Бейдж режима */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: gameMode === 'lives' ? '#FFEBEE' : '#E3F2FD',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                alignSelf: 'flex-start',
              }}
            >
              <Text style={{ fontSize: 14 }}>{gameMode === 'lives' ? '❤️' : '⏱️'}</Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: gameMode === 'lives' ? '#FF5252' : '#2196F3',
                }}
              >
                {gameMode === 'lives' ? 'На жизни' : 'На время'}
              </Text>
            </View>

            <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>
              {currentLevel.title}
            </Text>
            <Text style={{ fontSize: 12, color: '#666' }}>
              {currentLevel.description}
            </Text>
          </View>
        )}

        {/* Статистика */}
        <StatsCard
          score={data?.score ?? 0}
          accuracy={data?.accuracy ?? 0}
          duration={data?.durationPlayedSec ?? 0}
          timeBonus={data?.timeBonus}
          gameMode={gameMode}
        />

        {/* Звёзды */}
        <StarsDisplay
          stars={stars}
          nextLevelUnlocked={nextLevelUnlocked && !!nextLevel}
          nextLevelTitle={nextLevel?.title}
          gameMode={gameMode}
        />

        {/* Ошибки */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>
            Ошибки {errorItems.length > 0 && `(${errorItems.length})`}
          </Text>
          <ErrorList errors={errorItems} pack={pack} />
        </View>

        {/* Кнопки действий */}
        <ActionButtons
          onNextLevel={nextLevelUnlocked && nextLevel ? handleNextLevel : undefined}
          onRetryErrors={repeatSet.length > 0 ? handleRetryErrors : undefined}
          onRetryLevel={handleRetryLevel}
          onBackToPack={resetToPack}
          nextLevelAvailable={!!(nextLevelUnlocked && nextLevel && stars >= 1)}
          errorsCount={repeatSet.length}
        />

        {/* Индикатор сохранения */}
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>
            {saved ? '✓ Прогресс сохранён' : saveError ? `❌ Ошибка: ${saveError}` : '💾 Сохранение...'}
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}
