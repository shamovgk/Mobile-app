/**
 * Игровой экран с поддержкой системы уровней
 * 
 * Изменения:
 * - Добавлен параметр levelId
 * - Звуки и вибрация управляются настройками
 * - Прогресс автоматически сохраняется в levelProgress
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getPackById } from '@/lib/content';
import { buildSessionPlan } from '@/lib/engine';
import { applyAnswer, defaultScore } from '@/lib/scoring';
import { sfxDispose, sfxFail, sfxInit, sfxOk } from '@/lib/sfx';
import type { LevelConfig, RunSummary } from '@/lib/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, BackHandler, Modal, Pressable, Text, View } from 'react-native';

const BONUS_PER_SEC = 50;

export default function RunScreen() {
  const { packId, levelId, level, seed, mode, repeat, distractorMode } = useLocalSearchParams<{
    packId: string;
    levelId: string;
    level: string;
    seed?: string;
    mode?: 'normal' | 'review';
    repeat?: string;
    distractorMode?: 'easy' | 'normal' | 'hard';
  }>();

  const router = useRouter();
  const navigation = useNavigation();

  const levelConfig: LevelConfig = useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(level ?? '')) as LevelConfig;
    } catch {
      return { durationSec: 60, forkEverySec: 2.5, lanes: 2, allowedTypes: ['meaning'], lives: 3 };
    }
  }, [level]);

  const pack = getPackById(packId!)!;
  const sessionSeed = seed ?? `${pack.id}-${levelId}-default`;
  const isReviewMode = mode === 'review';

  const repeatSet: string[] | null = useMemo(() => {
    if (!repeat) return null;
    try {
      return JSON.parse(decodeURIComponent(repeat)) as string[];
    } catch {
      return null;
    }
  }, [repeat]);

  const effectiveLevel: LevelConfig = useMemo(() => {
    if (isReviewMode && repeatSet && repeatSet.length > 0) {
      const suggested = Math.min(60, Math.max(15, repeatSet.length * 5));
      return { ...levelConfig, durationSec: suggested };
    }
    return levelConfig;
  }, [isReviewMode, repeatSet, levelConfig]);

  const plan = useMemo(
    () =>
      buildSessionPlan({
        pack,
        level: effectiveLevel,
        seed: sessionSeed,
        restrictLexemes: isReviewMode && repeatSet && repeatSet.length > 0 ? repeatSet : undefined,
        distractorMode: distractorMode ?? 'normal',
      }),
    [pack, effectiveLevel, sessionSeed, isReviewMode, repeatSet, distractorMode]
  );

  const [scoreState, setScoreState] = useState(defaultScore);
  const scoreRef = useRef(scoreState);
  useEffect(() => {
    scoreRef.current = scoreState;
  }, [scoreState]);

  const [timerLeft, setTimerLeft] = useState(effectiveLevel.durationSec);
  const sessionActiveRef = useRef(true);
  const [isPaused, setPaused] = useState(false);

  const [slotIdx, setSlotIdx] = useState(0);
  const slotIdxRef = useRef(0);
  const setSlotIdxWrapper = (v: number | ((n: number) => number)) => {
    setSlotIdx((prev) => {
      const next = typeof v === 'function' ? (v as any)(prev) : v;
      slotIdxRef.current = next;
      return next;
    });
  };

  const [options, setOptions] = useState(plan.slots[0]?.options ?? []);
  const [highlight, setHighlight] = useState<{ index: number; correct: boolean } | null>(null);

  useEffect(() => {
    const next = plan.slots[Math.min(slotIdx, plan.slots.length - 1)]?.options ?? [];
    setOptions([...next]);
    setHighlight(null);
  }, [slotIdx, plan.slots]);

  const [livesLeft, setLivesLeft] = useState(effectiveLevel.lives);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  useEffect(() => {
    (async () => {
      const sound = await AsyncStorage.getItem('settings:sound');
      const haptics = await AsyncStorage.getItem('settings:haptics');
      if (sound !== null) setSoundEnabled(sound === 'true');
      if (haptics !== null) setHapticsEnabled(haptics === 'true');
    })();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await sfxInit();
    })();
    return () => {
      mounted = false;
      sfxDispose();
    };
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background' || s === 'inactive') setPaused(true);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => {
      setPaused(true);
      return true;
    });
    const beforeRemove = navigation.addListener('beforeRemove', (e: any) => {
      if (!sessionActiveRef.current) return;
      e.preventDefault();
      setPaused(true);
    });
    return () => {
      backSub.remove();
      beforeRemove();
    };
  }, [navigation]);

  const startRef = useRef<number>(Date.now());
  const pausedAccumRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);
  const durationMs = effectiveLevel.durationSec * 1000;

  useEffect(() => {
    const now = Date.now();
    if (isPaused) {
      if (pauseStartRef.current === null) pauseStartRef.current = now;
    } else {
      if (pauseStartRef.current !== null) {
        pausedAccumRef.current += now - pauseStartRef.current;
        pauseStartRef.current = null;
      }
    }
  }, [isPaused]);

  useEffect(() => {
    if (!sessionActiveRef.current || isPaused) return;

    let raf = 0;
    const loop = () => {
      const now = Date.now();
      const pausedNow = pausedAccumRef.current + (pauseStartRef.current ? now - pauseStartRef.current : 0);
      const elapsed = now - startRef.current - pausedNow;
      const leftSec = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      setTimerLeft(leftSec);

      if (elapsed >= durationMs) {
        finishSession();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isPaused, durationMs]);

  const answersRef = useRef<RunSummary['answers']>([]);

  const finishSession = (extraScore = 0) => {
    if (!sessionActiveRef.current) return;
    sessionActiveRef.current = false;

    const finalScore = scoreRef.current.score + extraScore;
    const accuracy = scoreRef.current.total > 0 ? scoreRef.current.correct / scoreRef.current.total : 0;

    const summary: RunSummary = {
      packId: pack.id,
      levelId: levelId!, // Добавлен levelId
      score: finalScore,
      accuracy,
      errors: Array.from(new Set(scoreRef.current.errors.map((e) => ({ lexemeId: e })))),
      durationPlayedSec: effectiveLevel.durationSec - Math.max(0, timerLeft),
      seed: sessionSeed,
      level: effectiveLevel,
      answers: answersRef.current ?? [],
      timeBonus: extraScore > 0 ? extraScore : 0,
      comboMax: 0,
    };

    router.replace({ pathname: '/result', params: { summary: encodeURIComponent(JSON.stringify(summary)) } });
  };

  const answerPick = async (laneIndex: 0 | 1 | 2) => {
    if (slotIdxRef.current >= plan.slots.length) return;

    const slot = plan.slots[slotIdxRef.current];
    const opt = options?.[laneIndex];
    if (!slot || !opt) return;

    const isCorrect = !!opt.isCorrect;

    if (isCorrect) {
      if (soundEnabled || hapticsEnabled) {
        await sfxOk(hapticsEnabled);
      }
    } else {
      if (soundEnabled || hapticsEnabled) {
        await sfxFail(hapticsEnabled);
      }

      const newLives = livesLeft - 1;
      setLivesLeft(newLives);

      if (newLives <= 0) {
        setTimeout(() => {
          finishSession(0);
        }, 500);
        return;
      }
    }

    setScoreState((st) => applyAnswer(st, isCorrect, slot.lexemeId));
    setHighlight({ index: laneIndex, correct: isCorrect });

    setTimeout(() => {
      setHighlight(null);
      const next = slotIdxRef.current + 1;
      setSlotIdxWrapper(next);

      if (next >= plan.slots.length) {
        const bonus = remainingSeconds() * BONUS_PER_SEC;
        finishSession(bonus);
      }
    }, 300);
  };

  const remainingSeconds = () => {
    const now = Date.now();
    const pausedNow = pausedAccumRef.current + (pauseStartRef.current ? now - pauseStartRef.current : 0);
    const elapsed = now - startRef.current - pausedNow;
    return Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
  };

  const resumeRun = () => setPaused(false);
  const exitRun = () => {
    sessionActiveRef.current = false;
    router.back();
  };

  const slot = plan.slots[Math.min(slotIdx, plan.slots.length - 1)];
  const accuracy = scoreState.total > 0 ? scoreState.correct / scoreState.total : 0;
  const stars = accuracy >= 0.95 ? 3 : accuracy >= 0.85 ? 2 : accuracy >= 0.70 ? 1 : 0;

  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 16 }}>
      {/* HUD */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ThemedText>Очки: {scoreState.score}</ThemedText>
        <ThemedText>❤️ {livesLeft}</ThemedText>
        <ThemedText>{timerLeft}s</ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => setPaused(true)}
          style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#ccc' }}
        >
          <ThemedText>⏸</ThemedText>
        </Pressable>
      </View>

      {/* Прогресс-бар времени */}
      <View style={{ height: 10, backgroundColor: '#eee', borderRadius: 5 }}>
        <View
          style={{
            height: '100%',
            width: `${((effectiveLevel.durationSec - timerLeft) / effectiveLevel.durationSec) * 100}%`,
            backgroundColor: '#27ae60',
            borderRadius: 5,
          }}
        />
      </View>

      {/* Звёзды */}
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {Array.from({ length: 3 }, (_, i) => (
          <Text key={i} style={{ fontSize: 24, color: i < stars ? '#FFD700' : '#ccc' }}>
            ★
          </Text>
        ))}
      </View>

      {/* Индикатор слота */}
      <View style={{ padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#eee' }}>
        <ThemedText>
          {Math.min(slotIdx + 1, plan.slots.length)}/{plan.slots.length}
        </ThemedText>
      </View>

      {/* Карточка вопроса */}
      <View
        style={{
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#ddd',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 100,
        }}
      >
        <ThemedText style={{ fontSize: 28, fontWeight: '700' }}>{slot.prompt}</ThemedText>
      </View>

      {/* Варианты ответов */}
      <View style={{ flex: 1, flexDirection: 'row', gap: 12 }}>
        {options.map((opt, i) => {
          let bgColor = '#FFFFFF';
          if (highlight && highlight.index === i) {
            bgColor = highlight.correct ? '#27ae60' : '#eb5757';
          }

          return (
            <View
              key={`${slot.index}-${i}-${opt.id}`}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: bgColor,
              }}
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => answerPick(i as 0 | 1 | 2)}
                style={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: '600', textAlign: 'center' }}>{opt.id}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Досрочное завершение */}
      <Pressable
        accessibilityRole="button"
        onPress={() => finishSession(remainingSeconds() * BONUS_PER_SEC)}
        style={{ padding: 16, borderRadius: 12, backgroundColor: '#27ae60', alignItems: 'center' }}
      >
        <ThemedText style={{ color: 'white' }}>
          Завершить досрочно (бонус: +{remainingSeconds() * BONUS_PER_SEC})
        </ThemedText>
      </Pressable>

      {/* Модальное окно паузы */}
      <Modal transparent visible={isPaused} animationType="fade" onRequestClose={resumeRun}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ width: '100%', maxWidth: 420, backgroundColor: 'white', borderRadius: 16, padding: 20, gap: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', textAlign: 'center' }}>Пауза</Text>
            <Text style={{ textAlign: 'center' }}>Игра приостановлена. Продолжить или выйти?</Text>

            <Pressable
              accessibilityRole="button"
              onPress={resumeRun}
              style={{ padding: 14, borderRadius: 12, backgroundColor: '#2f80ed', alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Продолжить</Text>
            </Pressable>

            <View style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f2c94c', backgroundColor: '#fffbf0' }}>
              <Text style={{ textAlign: 'center', fontSize: 14 }}>⚠️ Прогресс не будет сохранён при выходе.</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={exitRun}
              style={{ padding: 14, borderRadius: 12, backgroundColor: '#eb5757', alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>Выйти</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
