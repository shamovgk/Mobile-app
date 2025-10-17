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
import { SafeAreaView } from 'react-native-safe-area-context';

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

  // Новое состояние для интерактивных типов
  const [userAnswer, setUserAnswer] = useState<string>(''); // Для anagram/context

  useEffect(() => {
    const next = plan.slots[Math.min(slotIdx, plan.slots.length - 1)]?.options ?? [];
    setOptions([...next]);
    setHighlight(null);
    setUserAnswer(''); // Сброс при смене слота
    setUsedLetterIndices(new Set());
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
      levelId: levelId!,
      score: finalScore,
      accuracy,
      errors: Array.from(new Set(scoreRef.current.errors.map((e) => ({ lexemeId: e })))),
      durationPlayedSec: effectiveLevel.durationSec - Math.max(0, timerLeft),
      seed: sessionSeed,
      level: effectiveLevel,
      answers: answersRef.current ?? [],
      timeBonus: extraScore > 0 ? extraScore : 0,
      comboMax: 0,
      distractorMode: distractorMode ?? 'normal',
    };

    router.replace({ pathname: '/result', params: { summary: encodeURIComponent(JSON.stringify(summary)) } });
  };

  const answerPick = async (laneIndex: 0 | 1 | 2) => {
    if (slotIdxRef.current >= plan.slots.length) return;

    const slot = plan.slots[slotIdxRef.current];
    const opt = options?.[laneIndex];
    if (!slot || !opt) return;

    const isCorrect = !!opt.isCorrect;

    const existingAnswerIndex = answersRef.current.findIndex(a => a.lexemeId === slot.lexemeId);
    
    if (existingAnswerIndex >= 0) {
      answersRef.current[existingAnswerIndex].attempts += 1;
      if (!isCorrect) {
        answersRef.current[existingAnswerIndex].isCorrect = false;
      }
    } else {
      answersRef.current.push({
        lexemeId: slot.lexemeId,
        isCorrect: isCorrect,
        attempts: 1,
        usedHint: false,
        timeToAnswerMs: 0,
      });
    }

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

  /**
   * Обработка ответа для anagram/context
   */
  const submitAnswer = async () => {
    if (slotIdxRef.current >= plan.slots.length) return;

    const slot = plan.slots[slotIdxRef.current];
    if (!slot || !slot.correctAnswer) return;

    const isCorrect = userAnswer.toLowerCase().trim() === slot.correctAnswer.toLowerCase();

    const existingAnswerIndex = answersRef.current.findIndex(a => a.lexemeId === slot.lexemeId);
    
    if (existingAnswerIndex >= 0) {
      answersRef.current[existingAnswerIndex].attempts += 1;
      if (!isCorrect) {
        answersRef.current[existingAnswerIndex].isCorrect = false;
      }
    } else {
      answersRef.current.push({
        lexemeId: slot.lexemeId,
        isCorrect: isCorrect,
        attempts: 1,
        usedHint: false,
        timeToAnswerMs: 0,
      });
    }

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

    setTimeout(() => {
      const next = slotIdxRef.current + 1;
      setSlotIdxWrapper(next);
      setUserAnswer('');

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
  // Новое состояние для отслеживания использованных букв по индексу
  const [usedLetterIndices, setUsedLetterIndices] = useState<Set<number>>(new Set());

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top', 'left', 'right']}>
      <ThemedView style={{ flex: 1, padding: 16, gap: 12, backgroundColor: '#000' }}>
        {/* HUD */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Очки: {scoreState.score}</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>❤️ {livesLeft}</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>{timerLeft}s</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPaused(true)}
            style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#333' }}
          >
            <Text style={{ fontSize: 18, color: '#fff' }}>⏸</Text>
          </Pressable>
        </View>

        {/* Прогресс-бар */}
        <View style={{ height: 8, backgroundColor: '#333', borderRadius: 4 }}>
          <View
            style={{
              height: '100%',
              width: `${((effectiveLevel.durationSec - timerLeft) / effectiveLevel.durationSec) * 100}%`,
              backgroundColor: '#27ae60',
              borderRadius: 4,
            }}
          />
        </View>

        {/* Индикатор слота */}
        <View style={{ padding: 8, borderRadius: 8, backgroundColor: '#222', alignSelf: 'center' }}>
          <Text style={{ fontSize: 14, color: '#fff' }}>
            {Math.min(slotIdx + 1, plan.slots.length)}/{plan.slots.length}
          </Text>
        </View>

        {/* Карточка вопроса */}
        <View
          style={{
            padding: 20,
            borderRadius: 16,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 120,
            gap: 12,
          }}
        >
          {/* Заголовок */}
          <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f5f5f5' }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#666', textAlign: 'center' }}>
              {slot.type === 'meaning' && '🔤 Выберите перевод'}
              {slot.type === 'form' && '📝 Правильное написание'}
              {slot.type === 'anagram' && '🔀 Соберите слово из букв'}
              {slot.type === 'context' && '💡 Выберите правильную форму'}
            </Text>
          </View>

          {/* Текст вопроса */}
          <Text style={{ fontSize: slot.type === 'context' ? 18 : 32, fontWeight: '700', color: '#000', textAlign: 'center' }}>
            {slot.prompt}
          </Text>
        </View>

        {/* ВАРИАНТЫ ОТВЕТА */}
        {(slot.type === 'meaning' || slot.type === 'form') && (
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
                    borderWidth: 2,
                    borderColor: '#333',
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
                      paddingHorizontal: 12,
                    }}
                  >
                    <Text style={{ fontSize: 20, fontWeight: '600', textAlign: 'center', color: '#000' }}>{opt.id}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {/* АНАГРАММА */}
        {slot.type === 'anagram' && slot.letters && (
          <View style={{ flex: 1, gap: 16 }}>
            {/* Поле ввода */}
            <View style={{ padding: 16, borderRadius: 12, backgroundColor: '#fff', borderWidth: 2, borderColor: '#2196f3' }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: '#000', textAlign: 'center', letterSpacing: 2 }}>
                {userAnswer || '___'}
              </Text>
            </View>
        
            {/* Буквы для выбора */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {slot.letters.map((letter, i) => {
                // Проверяем использована ли ЭТА КОНКРЕТНАЯ буква по индексу
                const isUsed = usedLetterIndices.has(i);
              
                return (
                  <Pressable
                    key={i}
                    onPress={() => {
                      if (!isUsed) {
                        setUserAnswer(prev => prev + letter);
                        setUsedLetterIndices(prev => new Set([...prev, i]));
                      }
                    }}
                    disabled={isUsed}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 12,
                      backgroundColor: isUsed ? '#e0e0e0' : '#fff',
                      borderWidth: 2,
                      borderColor: isUsed ? '#9e9e9e' : '#333',
                      justifyContent: 'center',
                      alignItems: 'center',
                      opacity: isUsed ? 0.4 : 1,
                    }}
                  >
                    <Text style={{ fontSize: 24, fontWeight: '700', color: isUsed ? '#9e9e9e' : '#000' }}>
                      {letter.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            
            {/* Кнопки управления */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => {
                  // Удаляем последнюю букву и её индекс
                  if (userAnswer.length > 0) {
                    setUserAnswer(prev => prev.slice(0, -1));
                    // Удаляем последний использованный индекс
                    const indices = Array.from(usedLetterIndices);
                    if (indices.length > 0) {
                      indices.pop();
                      setUsedLetterIndices(new Set(indices));
                    }
                  }
                }}
                disabled={userAnswer.length === 0}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: userAnswer.length > 0 ? '#ff9800' : '#ccc',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>← Удалить</Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  // Очистить всё
                  setUserAnswer('');
                  setUsedLetterIndices(new Set());
                }}
                disabled={userAnswer.length === 0}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: userAnswer.length > 0 ? '#f44336' : '#ccc',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>✕ Очистить</Text>
              </Pressable>
              
              <Pressable
                onPress={submitAnswer}
                disabled={userAnswer.length === 0}
                style={{
                  flex: 2,
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: userAnswer.length > 0 ? '#4caf50' : '#ccc',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>✓ Проверить</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* КОНТЕКСТ */}
        {slot.type === 'context' && slot.words && (
          <View style={{ flex: 1, gap: 16 }}>
            {/* Выбранное слово */}
            <View style={{ padding: 16, borderRadius: 12, backgroundColor: '#fff', borderWidth: 2, borderColor: '#2196f3' }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#000', textAlign: 'center' }}>
                {userAnswer || '?'}
              </Text>
            </View>

            {/* Варианты слов */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {slot.words.map((word, i) => (
                <Pressable
                  key={i}
                  onPress={() => setUserAnswer(word)}
                  style={{
                    flex: 1,
                    padding: 20,
                    borderRadius: 12,
                    backgroundColor: userAnswer === word ? '#2196f3' : '#fff',
                    borderWidth: 2,
                    borderColor: '#333',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: '600', color: userAnswer === word ? '#fff' : '#000' }}>
                    {word}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Кнопка проверки */}
            <Pressable
              onPress={submitAnswer}
              disabled={userAnswer.length === 0}
              style={{
                padding: 16,
                borderRadius: 12,
                backgroundColor: userAnswer.length > 0 ? '#4caf50' : '#ccc',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>✓ Проверить</Text>
            </Pressable>
          </View>
        )}

        {/* Модальное окно паузы */}
        <Modal transparent visible={isPaused} animationType="fade" onRequestClose={resumeRun}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <View style={{ width: '100%', maxWidth: 420, backgroundColor: 'white', borderRadius: 16, padding: 20, gap: 12 }}>
              <Text style={{ fontSize: 20, fontWeight: '600', textAlign: 'center', color: '#000' }}>Пауза</Text>
              <Text style={{ textAlign: 'center', color: '#666' }}>Игра приостановлена. Продолжить или выйти?</Text>

              <Pressable
                accessibilityRole="button"
                onPress={resumeRun}
                style={{ padding: 14, borderRadius: 12, backgroundColor: '#2f80ed', alignItems: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Продолжить</Text>
              </Pressable>

              <View style={{ padding: 12, borderRadius: 12, backgroundColor: '#fffbf0', borderWidth: 1, borderColor: '#f2c94c' }}>
                <Text style={{ textAlign: 'center', fontSize: 14, color: '#856404' }}>⚠️ Прогресс не будет сохранён при выходе.</Text>
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
    </SafeAreaView>
  );
}
