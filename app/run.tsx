import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getPackById } from '@/lib/content';
import { buildSessionPlan } from '@/lib/engine';
import { applyAnswer, defaultScore } from '@/lib/scoring';
import { sfxDispose, sfxFail, sfxInit, sfxOk } from '@/lib/sfx';
import type { LevelConfig, RunSummary } from '@/lib/types';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, BackHandler, Easing, Modal, Pressable, Text, View } from 'react-native';
import { State as GHState, PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

export default function RunScreen() {
  const { packId, level, seed, mode } = useLocalSearchParams<{
    packId: string;
    level: string;
    seed?: string;
    mode?: 'normal' | 'review';
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

  const pack = getPackById((packId as string) ?? 'pack-basic-1')!;
  const sessionSeed = (seed as string) ?? `${pack.id}-seed-default`;

  // План сессии
  const plan = useMemo(() => buildSessionPlan({ pack, level: levelConfig, seed: sessionSeed }), [pack, levelConfig, sessionSeed]);

  // HUD
  const [scoreState, setScoreState] = useState(() => defaultScore(levelConfig.lives));
  const [timerLeft, setTimerLeft] = useState(levelConfig.durationSec);

  // Состояние сессии/паузы
  const sessionActiveRef = useRef(true);
  const [isPaused, setPaused] = useState(false);

  // Текущий слот и «окно ответа»
  const [slotIdx, setSlotIdx] = useState(0);
  const answeredRef = useRef(false); // был ли ответ в текущем слоте

  // Анимации: карточка и подсветки дорожек
  const cardTranslateX = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const lanePulse = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  // Инициализация аудио/вибро
  useEffect(() => {
    sfxInit();
    return () => { sfxDispose(); };
  }, []);

  // Блокируем уход: только пауза/finish
  useEffect(() => {
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => {
      setPaused(true);
      return true;
    });
    const beforeRemove = navigation.addListener('beforeRemove', (e) => {
      if (!sessionActiveRef.current) return;
      e.preventDefault();
      setPaused(true);
    });
    return () => {
      backSub.remove();
      beforeRemove();
    };
  }, [navigation]);

  // Автопауза при сворачивании
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') setPaused(true);
    });
    return () => sub.remove();
  }, []);

  // Таймер слотов: шаги по forkEverySec, автопромах если не ответили
  useEffect(() => {
    if (!sessionActiveRef.current || isPaused) return;

    let raf = 0;
    const startedAt = Date.now();
    const durationMs = levelConfig.durationSec * 1000;
    const stepMs = Math.max(250, levelConfig.forkEverySec * 1000);
    let nextSlotTime = stepMs;
    let lastTick = startedAt;

    const missCurrentIfNeeded = () => {
      if (!answeredRef.current) {
        const curSlot = plan.slots[slotIdx];
        // промах
        setScoreState((st) => applyAnswer(st, false, curSlot.lexemeId));
        pulseLane(curSlot, null); // нейтрально
        // мягкое «аттенюация» карточки
        feedbackCard(0);
      }
      answeredRef.current = false;
    };

    const loop = () => {
      const now = Date.now();
      const elapsed = now - startedAt;
      const dt = now - lastTick;
      lastTick = now;

      // таймер
      setTimerLeft(Math.max(0, Math.ceil((durationMs - elapsed) / 1000)));

      // переходы по временным меткам
      while (elapsed >= nextSlotTime) {
        // если не ответили — считаем промах
        missCurrentIfNeeded();
        // следующий слот
        setSlotIdx((s) => Math.min(plan.slots.length - 1, s + 1));
        nextSlotTime += stepMs;
      }

      if (elapsed >= durationMs || scoreState.lives <= 0) {
        finishSession();
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, plan.slots.length, levelConfig.durationSec, levelConfig.forkEverySec, slotIdx, scoreState.lives]);

  const resumeRun = () => setPaused(false);
  const exitRun = () => {
    sessionActiveRef.current = false;
    router.back();
  };

  const finishSession = () => {
    if (!sessionActiveRef.current) return;
    sessionActiveRef.current = false;
    const accuracy = scoreState.total > 0 ? scoreState.correct / scoreState.total : 0;
    const summary: RunSummary = {
      packId: pack.id,
      score: scoreState.score,
      accuracy,
      errors: scoreState.errors.map((lexemeId) => ({ lexemeId })),
      durationPlayedSec: levelConfig.durationSec - timerLeft,
      seed: sessionSeed,
      level: levelConfig,
    };
    router.replace({
      pathname: '/result',
      params: { summary: encodeURIComponent(JSON.stringify(summary)) },
    });
  };

  // Анимация карточки: сдвиг и затухание при ответе
  const feedbackCard = (dir: -1 | 0 | 1) => {
    cardTranslateX.stopAnimation();
    cardOpacity.stopAnimation();
    const toX = dir === 0 ? 0 : dir * 40; // небольшой сдвиг
    Animated.parallel([
      Animated.timing(cardTranslateX, { toValue: toX, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(cardOpacity, { toValue: 0.85, duration: 120, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]),
    ]).start();
  };

  // Подсветка выбранной/промахнутой дорожки
  const pulseLane = (slot: (typeof plan.slots)[number], pickedIndex: number | null) => {
    lanePulse.forEach((v, idx) => {
      const active = pickedIndex === null ? false : idx === pickedIndex;
      v.stopAnimation();
      v.setValue(0);
      Animated.timing(v, { toValue: active ? 1 : 0.4, duration: 160, useNativeDriver: false }).start(() => {
        Animated.timing(v, { toValue: 0, duration: 200, useNativeDriver: false }).start();
      });
    });
  };

  // Обработка свайпов (лево/право)
  const onGestureEvent = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
    // визуальный параллакс карточки
    const delta = Math.max(-60, Math.min(60, nativeEvent.translationX));
    cardTranslateX.setValue(delta * 0.2);
  };

  const onHandlerStateChange = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
    if (!sessionActiveRef.current || isPaused) return;

    if ((nativeEvent as any).state === GHState.END || (nativeEvent as any).state === GHState.CANCELLED || (nativeEvent as any).state === GHState.FAILED) {
      const dx = nativeEvent.translationX;
      // Порог распознавания
      if (Math.abs(dx) < 60) {
        feedbackCard(0);
        return;
      }
      const pick = dx < 0 ? 0 : 1; // 2 дорожки: 0 — левая, 1 — правая
      answerPick(pick);
    }
  };

  const answerPick = async (laneIndex: 0 | 1) => {
    if (answeredRef.current) return; // уже ответили в этом слоте
    const slot = plan.slots[slotIdx];
    const opt = slot.options[laneIndex];
    const isCorrect = !!opt?.isCorrect;

    answeredRef.current = true;

    setScoreState((st) => applyAnswer(st, isCorrect, slot.lexemeId));
    pulseLane(slot, laneIndex);
    feedbackCard(isCorrect ? (laneIndex === 0 ? -1 : 1) : 0);
    if (isCorrect) await sfxOk(true);
    else await sfxFail(true);

    // Ранний переход к следующему слоту (чуть быстрее, чем таймер)
    if (slotIdx < plan.slots.length - 1) {
      setTimeout(() => setSlotIdx((s) => Math.min(plan.slots.length - 1, s + 1)), 100);
    }
  };

  const slot = plan.slots[slotIdx];

  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 16 }}>
      {/* HUD */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ThemedText>Score: {scoreState.score}</ThemedText>
        <ThemedText>Combo: x{scoreState.comboMul.toFixed(1)}</ThemedText>
        <ThemedText>♥ {scoreState.lives}</ThemedText>
        <ThemedText>⏱ {timerLeft}s</ThemedText>

        <Pressable
          accessibilityRole="button"
          onPress={() => setPaused(true)}
          style={{ marginLeft: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#ccc' }}
        >
          <ThemedText>⏸ Пауза</ThemedText>
        </Pressable>
      </View>

      {/* Инфо о плане (можно скрыть позже) */}
      <View style={{ padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#eee' }}>
        <ThemedText>Слотов: {plan.summary.totalSlots} • Дорожек: {plan.summary.lanes}</ThemedText>
        <ThemedText>Слот: {slotIdx + 1}/{plan.slots.length}</ThemedText>
      </View>

      {/* Жест на всю зону карточки/дорожек */}
      <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
        <Animated.View style={{ flex: 1 }}>
          {/* Карточка вопроса */}
          <Animated.View
            style={{
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#ddd',
              gap: 8,
              transform: [{ translateX: cardTranslateX }],
              opacity: cardOpacity,
            }}
          >
            <ThemedText type="defaultSemiBold">Слово: “{slot.prompt}”</ThemedText>
            <ThemedText>Свайп влево/вправо, чтобы выбрать дорожку</ThemedText>
          </Animated.View>

          {/* Дорожки */}
          <View style={{ flex: 1, flexDirection: 'row', gap: 12, marginTop: 12 }}>
            {slot.options.map((opt, i) => {
              const bg = lanePulse[i].interpolate({
                inputRange: [0, 1],
                outputRange: ['#FFFFFF', opt.isCorrect ? '#DFFFE0' : '#FFDADA'],
              });
              return (
                <Animated.View
                  key={`${slot.index}-${i}-${opt.id}`}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 8,
                    backgroundColor: bg as any,
                  }}
                >
                  <ThemedText>Дорожка {i + 1}</ThemedText>
                  <ThemedText>(вариант) {opt.id}</ThemedText>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>
      </PanGestureHandler>

      {/* Досрочное завершение (отладка) */}
      <Pressable
        accessibilityRole="button"
        onPress={finishSession}
        style={{ padding: 16, borderRadius: 12, backgroundColor: '#27ae60', alignItems: 'center' }}
      >
        <ThemedText style={{ color: 'white' }}>Завершить (демо)</ThemedText>
      </Pressable>

      {/* Пауза */}
      <Modal transparent visible={isPaused} animationType="fade" onRequestClose={resumeRun}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <View style={{ width: '100%', maxWidth: 420, backgroundColor: 'white', borderRadius: 16, padding: 20, gap: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', textAlign: 'center' }}>Пауза</Text>
            <Text style={{ textAlign: 'center' }}>Игра на паузе. Вы можете продолжить или выйти.</Text>

            <Pressable
              accessibilityRole="button"
              onPress={resumeRun}
              style={{ padding: 14, borderRadius: 12, backgroundColor: '#2f80ed', alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Продолжить</Text>
            </Pressable>

            <View style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f2c94c' }}>
              <Text style={{ textAlign: 'center' }}>⚠️ При выходе текущий прогресс забега будет потерян.</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={exitRun}
              style={{ padding: 14, borderRadius: 12, backgroundColor: '#eb5757', alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>Выйти из забега</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
