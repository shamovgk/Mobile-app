import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getPackById } from '@/lib/content';
import { buildSessionPlan } from '@/lib/engine';
import { applyAnswer, defaultScore } from '@/lib/scoring';
import { sfxDispose, sfxInit } from '@/lib/sfx';
import type { LevelConfig, RunSummary } from '@/lib/types';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, BackHandler, Modal, Pressable, Text, View } from 'react-native';

// Константы
const STUN_MS = 2000;
const BONUS_PER_SEC = 50;

export default function RunScreen() {
  const { packId, level, seed, mode, repeat, distractorMode } = useLocalSearchParams<{
    packId: string;
    level: string;
    seed?: string;
    mode?: 'normal' | 'review';
    repeat?: string; // URI-encoded JSON: string[]
    distractorMode?: 'easy' | 'normal' | 'hard';
  }>();
  const router = useRouter();
  const navigation = useNavigation();

  // Парсим уровень сессии
  const levelConfig: LevelConfig = useMemo(() => {
    try { return JSON.parse(decodeURIComponent(level ?? '')) as LevelConfig; }
    catch { return { durationSec: 60, forkEverySec: 2.5, lanes: 2, allowedTypes: ['meaning'], lives: 3 }; }
  }, [level]);

  const pack = getPackById(packId!)!;
  const sessionSeed = seed ?? `${pack.id}-seed-default`;
  const isReviewMode = mode === 'review';

  // Для режима review используем повтор ошибок
  const repeatSet: string[] | null = useMemo(() => {
    if (!repeat) return null;
    try { return JSON.parse(decodeURIComponent(repeat)) as string[]; }
    catch { return null; }
  }, [repeat]);

  const effectiveLevel: LevelConfig = useMemo(() => {
    if (isReviewMode && repeatSet && repeatSet.length > 0) {
      const suggested = Math.min(60, Math.max(15, repeatSet.length * 5));
      return { ...levelConfig, durationSec: suggested };
    }
    return levelConfig;
  }, [isReviewMode, repeatSet, levelConfig]);

  // Создаем план сессии
  const plan = useMemo(() => buildSessionPlan({
    pack,
    level: effectiveLevel,
    seed: sessionSeed,
    restrictLexemes: isReviewMode && repeatSet && repeatSet.length > 0 ? repeatSet : undefined,
    distractorMode: distractorMode ?? 'normal',  // Режим дистракторов
  }), [pack, effectiveLevel, sessionSeed, isReviewMode, repeatSet, distractorMode]);

  // Состояние счета
  const [scoreState, setScoreState] = useState(() => defaultScore());
  const scoreRef = useRef(scoreState);
  useEffect(() => { scoreRef.current = scoreState; }, [scoreState]);

  const [timerLeft, setTimerLeft] = useState(effectiveLevel.durationSec);
  const sessionActiveRef = useRef(true);
  const [isPaused, setPaused] = useState(false);
  const [slotIdx, _setSlotIdx] = useState(0);
  const slotIdxRef = useRef(0);
  const setSlotIdx = (v: number | ((n: number) => number)) => {
    _setSlotIdx(prev => {
      const next = typeof v === 'function' ? (v as any)(prev) : v;
      slotIdxRef.current = next;
      return next;
    });
  };

  // Текущие варианты для рендера + явная подсветка выбора
  const [options, setOptions] = useState(() => plan.slots[0]?.options ?? []);
  const [highlight, setHighlight] = useState<{ index: number; correct: boolean } | null>(null);

  useEffect(() => {
    const next = plan.slots[Math.min(slotIdx, plan.slots.length - 1)]?.options ?? [];
    setOptions([...next]);
    setHighlight(null);
  }, [slotIdx, plan.slots]);

  // Оглушение
  const stunnedUntilRef = useRef<number>(0);
  const [stunLeft, setStunLeft] = useState(0);

  // Визуальные эффекты
  const cardOpacity = useRef(new Animated.Value(1)).current;

  // Аудио/вибро
  useEffect(() => { sfxInit(); return () => { sfxDispose(); }; }, []);

  // Автопауза
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => { if (s === 'background' || s === 'inactive') setPaused(true); });
    return () => sub.remove();
  }, []);

  // Запрет выхода
  useEffect(() => {
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => { setPaused(true); return true; });
    const beforeRemove = navigation.addListener('beforeRemove', (e) => { if (!sessionActiveRef.current) return; e.preventDefault(); setPaused(true); });
    return () => { backSub.remove(); beforeRemove(); };
  }, [navigation]);

  // Таймер сессии
  const startRef = useRef<number>(Date.now());
  const pausedAccumRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);
  const durationMs = effectiveLevel.durationSec * 1000;

  useEffect(() => {
    const now = Date.now();
    if (isPaused) {
      if (pauseStartRef.current == null) pauseStartRef.current = now;
    } else {
      if (pauseStartRef.current != null) {
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

      const stunLeftMs = Math.max(0, stunnedUntilRef.current - now);
      setStunLeft(Math.ceil(stunLeftMs / 100) / 10);

      if (elapsed >= durationMs) {
        finishSession(); // время вышло
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isPaused, durationMs]);

  // Учёт ответов по словам (для SRS и Result)
  const answersRef = useRef<RunSummary['answers']>([]);

  const finishSession = (extraScore = 0) => {
    if (!sessionActiveRef.current) return;
    sessionActiveRef.current = false;
    const finalScore = scoreRef.current.score + extraScore;
    const accuracy = scoreRef.current.total > 0 ? scoreRef.current.correct / scoreRef.current.total : 0;

    const summary: RunSummary = {
      packId: pack.id,
      score: finalScore,
      accuracy,
      errors: Array.from(new Set(scoreRef.current.errors)).map((lexemeId) => ({ lexemeId })),
      durationPlayedSec: effectiveLevel.durationSec - Math.max(0, timerLeft),
      seed: sessionSeed,
      level: effectiveLevel,
      answers: answersRef.current ?? [],
      timeBonus: extraScore > 0 ? extraScore : 0,
      comboMax: 0,  // Возможно добавить максимальное комбо
    };

    router.replace({ pathname: '/result', params: { summary: encodeURIComponent(JSON.stringify(summary)) } });
  };

  const answerPick = async (laneIndex: 0 | 1) => {
    const now = Date.now();
    if (now < stunnedUntilRef.current) return;
    if (slotIdxRef.current >= plan.slots.length) return;

    const slot = plan.slots[slotIdxRef.current];
    const opt = options?.[laneIndex];
    if (!slot || !opt) return;

    const isCorrect = !!opt.isCorrect;
    setScoreState((st) => applyAnswer(st, isCorrect, slot.lexemeId));

    // Короткая задержка для визуального эффекта
    setTimeout(() => {
      setHighlight(null);
      const next = slotIdxRef.current + 1;
      setSlotIdx(next);
      if (next >= plan.slots.length) {
        const bonus = remainingSeconds() * BONUS_PER_SEC;
        finishSession(bonus);
      }
    }, 250);
  };

  const remainingSeconds = () => {
    const now = Date.now();
    const pausedNow = pausedAccumRef.current + (pauseStartRef.current ? now - pauseStartRef.current : 0);
    const elapsed = now - startRef.current - pausedNow;
    return Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
  };

  const resumeRun = () => setPaused(false);
  const exitRun = () => { sessionActiveRef.current = false; router.back(); };

  const slot = plan.slots[Math.min(slotIdx, plan.slots.length - 1)];

  // Оценка звезд (по точности)
  const accuracy = scoreState.total > 0 ? (scoreState.correct / scoreState.total) : 0;
  const stars = Math.floor(accuracy * 3);

  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 16 }}>
      {/* HUD */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ThemedText>Score: {scoreState.score}</ThemedText>
        <ThemedText>⏱ {timerLeft}s</ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => setPaused(true)}
          style={{ marginLeft: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#ccc' }}
        >
          <ThemedText>⏸ Пауза</ThemedText>
        </Pressable>
      </View>

      {/* Прогресс бар */}
      <View style={{ height: 10, backgroundColor: '#eee', borderRadius: 5, marginTop: 10 }}>
        <Animated.View
          style={{
            height: '100%',
            width: `${(100 - (timerLeft / effectiveLevel.durationSec) * 100)}%`,
            backgroundColor: '#27ae60',
            borderRadius: 5,
          }}
        />
      </View>

      {/* Звезды */}
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
        {Array.from({ length: 3 }, (_, i) => (
          <Text key={i} style={{ fontSize: 24, color: i < stars ? '#FFD700' : '#ccc' }}>
            ★
          </Text>
        ))}
      </View>

      {/* Статус */}
      <View style={{ padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#eee' }}>
        <ThemedText>Слово: {Math.min(slotIdx + 1, plan.slots.length)} / {plan.slots.length}</ThemedText>
      </View>

      {/* Карточка */}
      <Animated.View style={{ padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center', opacity: cardOpacity }}>
        <ThemedText style={{ fontSize: 28, fontWeight: '700' }}>{slot.prompt}</ThemedText>
      </Animated.View>

      {/* Варианты */}
      <View style={{ flex: 1, flexDirection: 'row', gap: 12, marginTop: 12 }}>
        {options.map((opt, i) => {
          let bgColor = '#FFFFFF';
          if (highlight && highlight.index === i) {
            bgColor = highlight.correct ? '#27ae60' : '#eb5757';  // зеленый / красный
          }

          return (
            <View key={`${slot.index}-${i}-${opt.id}`} style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: bgColor }}>
              <Pressable
                accessibilityRole="button"
                onPress={() => answerPick(i as 0 | 1)}
                style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 }}
              >
                <Text style={{ fontSize: 24, fontWeight: '700', textAlign: 'center' }}>{opt.id}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Завершить */}
      <Pressable accessibilityRole="button" onPress={() => finishSession()} style={{ padding: 16, borderRadius: 12, backgroundColor: '#27ae60', alignItems: 'center' }}>
        <ThemedText style={{ color: 'white' }}>Завершить</ThemedText>
      </Pressable>

      {/* Пауза */}
      <Modal transparent visible={isPaused} animationType="fade" onRequestClose={resumeRun}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ width: '100%', maxWidth: 420, backgroundColor: 'white', borderRadius: 16, padding: 20, gap: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', textAlign: 'center' }}>Пауза</Text>
            <Text style={{ textAlign: 'center' }}>Игра на паузе. Вы можете продолжить или выйти.</Text>
            <Pressable accessibilityRole="button" onPress={resumeRun} style={{ padding: 14, borderRadius: 12, backgroundColor: '#2f80ed', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>Продолжить</Text>
            </Pressable>
            <View style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f2c94c' }}>
              <Text style={{ textAlign: 'center' }}>⚠️ При выходе текущий прогресс забега будет потерян.</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={exitRun} style={{ padding: 14, borderRadius: 12, backgroundColor: '#eb5757', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '700' }}>Выйти из забега</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
