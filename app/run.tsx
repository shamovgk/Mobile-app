import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { LevelConfig, RunSummary } from '@/lib/types';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, BackHandler, Modal, Pressable, Text, View } from 'react-native';

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

  // HUD заглушки
  const [score] = useState(0);
  const [combo] = useState(0);
  const [lives] = useState(levelConfig.lives);
  const [timer] = useState(levelConfig.durationSec);

  // Управление жизненным циклом сессии и выходами
  const sessionActiveRef = useRef(true);
  const [isPaused, setPaused] = useState(false);

  // Полностью блокируем уход с экрана Run (свайпы/кнопка назад)
  useEffect(() => {
    const confirmLeave = () => {
      if (!sessionActiveRef.current) return false; // уже разрешили выход
      // Мы НЕ показываем алерт здесь, т.к. выход должен идти через меню паузы.
      // Просто блокируем любые попытки.
      return true; // блокируем действие «назад»
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', () => {
      // Блокируем системную «назад» на Android, открываем меню паузы
      setPaused(true);
      return true; // не уходим со страницы
    });

    const beforeRemove = navigation.addListener('beforeRemove', (e) => {
      if (!sessionActiveRef.current) return; // если уже разрешили — пропускаем
      e.preventDefault(); // блокируем pop/replace
      // открываем меню паузы как «точку выхода»
      setPaused(true);
    });

    return () => {
      backSub.remove();
      beforeRemove();
    };
  }, [navigation]);

  // Автопауза при сворачивании/уходе в фон
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        setPaused(true);
      }
    });
    return () => sub.remove();
  }, []);

  // Кнопки меню паузы
  const resumeRun = () => {
    setPaused(false);
  };

  const exitRun = () => {
    // Явно предупреждаем о потере прогресса в самом меню — а здесь уже выходим.
    sessionActiveRef.current = false; // разрешаем уход (снимем блок)
    router.back(); // назад к PackDetails
  };

  // Завершение сессии (демо)
  const finishSession = () => {
    sessionActiveRef.current = false; // разрешаем навигацию
    const summary: RunSummary = {
      packId: (packId as string) ?? 'unknown-pack',
      score: 1230,
      accuracy: 0.82,
      errors: [{ lexemeId: 'lex-1' }, { lexemeId: 'lex-2' }],
      durationPlayedSec: levelConfig.durationSec,
      seed: (seed as string) ?? 'seed',
      level: levelConfig,
    };
    router.replace({
      pathname: '/result',
      params: { summary: encodeURIComponent(JSON.stringify(summary)) },
    });
  };

  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 16 }}>
      {/* HUD */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ThemedText>Score: {score}</ThemedText>
        <ThemedText>Combo: x{combo}</ThemedText>
        <ThemedText>♥ {lives}</ThemedText>
        <ThemedText>⏱ {timer}s</ThemedText>

        {/* Кнопка Пауза */}
        <Pressable
          accessibilityRole="button"
          onPress={() => setPaused(true)}
          style={{ marginLeft: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#ccc' }}
        >
          <ThemedText>⏸ Пауза</ThemedText>
        </Pressable>
      </View>

      {/* Карточка вопроса (заглушка) */}
      <View
        style={{
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#ddd',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <ThemedText type="defaultSemiBold">Слово: “example”</ThemedText>
        <ThemedText>Выбери перевод свайпом по дорожке</ThemedText>
      </View>

      {/* Дорожки */}
      <View style={{ flex: 1, flexDirection: 'row', gap: 12 }}>
        {[0, 1].map((lane) => (
          <View
            key={lane}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ThemedText>Дорожка {lane + 1}</ThemedText>
            <ThemedText>(вариант ответа)</ThemedText>
          </View>
        ))}
      </View>

      {/* Кнопка завершения сессии (для проверки потока) */}
      <Pressable
        accessibilityRole="button"
        onPress={finishSession}
        style={{ padding: 16, borderRadius: 12, backgroundColor: '#27ae60', alignItems: 'center' }}
      >
        <ThemedText style={{ color: 'white' }}>Завершить (демо)</ThemedText>
      </Pressable>

      {/* Меню паузы — модальное окно поверх игры */}
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
            <Text style={{ textAlign: 'center' }}>
              Игра поставлена на паузу. Вы можете продолжить или выйти.
            </Text>

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
