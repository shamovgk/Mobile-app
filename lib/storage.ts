/**
 * Модуль для работы с локальным хранилищем прогресса
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  LevelProgress,
  LexemeProgress,
  Pack,
  PackLevel,
  ProgressState,
  RunSummary,
} from './types';

const PROGRESS_KEY = 'progress:v1';

/**
 * Загружает состояние прогресса
 */
export async function loadProgress(): Promise<ProgressState> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return { packs: {} };
    return JSON.parse(raw) as ProgressState;
  } catch {
    return { packs: {} };
  }
}

/**
 * Сохраняет состояние прогресса
 */
export async function saveProgress(state: ProgressState): Promise<void> {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
}

/**
 * Сбрасывает весь прогресс
 */
export async function resetProgress(): Promise<void> {
  await AsyncStorage.removeItem(PROGRESS_KEY);
}

/**
 * Обновляет прогресс слова с учётом сложности уровня
 * 
 * Система мастерства:
 * - easy: множитель 0.5x (нужно 10 правильных для mastery 5)
 * - normal: множитель 1.0x (нужно 5 правильных)
 * - hard: множитель 1.5x (нужно 4 правильных)
 * 
 * При ошибке: -0.5 mastery
 */
export async function updateLexemeProgress(
  packId: string,
  lexemeId: string,
  wasCorrect: boolean,
  levelDifficulty: 'easy' | 'normal' | 'hard'
): Promise<void> {
  const state = await loadProgress();
  if (!state.packs[packId]) state.packs[packId] = {};

  const current = state.packs[packId][lexemeId] ?? {
    mastery: 0,
    recentMistakes: [],
  };

  // Множители сложности
  const difficultyMultiplier: Record<string, number> = {
    easy: 0.5,
    normal: 1.0,
    hard: 1.5,
  };

  const multiplier = difficultyMultiplier[levelDifficulty] ?? 1.0;

  let newMastery = current.mastery;

  if (wasCorrect) {
    // Увеличиваем мастерство с учётом множителя
    newMastery = Math.min(5, current.mastery + multiplier);
  } else {
    // При ошибке снижаем мастерство
    newMastery = Math.max(0, current.mastery - 0.5);
  }

  // Управление недавними ошибками (максимум 10)
  let mistakes = [...current.recentMistakes];
  if (!wasCorrect) {
    mistakes.push(new Date().toISOString());
    mistakes = mistakes.slice(-10);
  } else {
    // При правильном ответе убираем старые ошибки (старше 7 дней)
    mistakes = mistakes.filter((m) => {
      const errorDate = new Date(m);
      const now = new Date();
      const daysDiff = (now.getTime() - errorDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff < 7;
    });
  }

  state.packs[packId][lexemeId] = {
    mastery: Math.round(newMastery * 10) / 10, // Округляем до 0.1
    recentMistakes: mistakes,
  };

  await saveProgress(state);
}

/**
 * Получает прогресс конкретного слова
 */
export async function getLexemeProgress(packId: string, lexemeId: string): Promise<LexemeProgress> {
  const state = await loadProgress();
  return (
    state.packs[packId]?.[lexemeId] ?? {
      mastery: 0,
      recentMistakes: [],
    }
  );
}

/**
 * Обновляет прогресс уровня после завершения
 */
export async function updateLevelProgress(
  packId: string,
  levelId: string,
  score: number,
  accuracy: number
): Promise<void> {
  const st = await loadProgress();
  if (!st.levelProgress) st.levelProgress = {};
  if (!st.levelProgress[packId]) st.levelProgress[packId] = {};

  const current = st.levelProgress[packId][levelId] ?? {
    levelId,
    stars: 0,
    bestScore: 0,
    bestAccuracy: 0,
    completed: false,
    attempts: 0,
  };

  // Расчёт звёзд: 3★ = 95%+, 2★ = 85%+, 1★ = 70%+
  const newStars = accuracy >= 0.95 ? 3 : accuracy >= 0.85 ? 2 : accuracy >= 0.70 ? 1 : 0;

  const updatedProgress: LevelProgress = {
    levelId,
    stars: Math.max(current.stars, newStars) as 0 | 1 | 2 | 3,
    bestScore: Math.max(current.bestScore, score),
    bestAccuracy: Math.max(current.bestAccuracy, accuracy),
    completed: newStars === 3 || current.completed,
    attempts: current.attempts + 1,
    lastPlayedAt: new Date().toISOString(),
  };

  st.levelProgress[packId][levelId] = updatedProgress;
  await saveProgress(st);
}

/**
 * Получает прогресс конкретного уровня
 */
export async function getLevelProgress(packId: string, levelId: string): Promise<LevelProgress> {
  const st = await loadProgress();
  return (
    st.levelProgress?.[packId]?.[levelId] ?? {
      levelId,
      stars: 0,
      bestScore: 0,
      bestAccuracy: 0,
      completed: false,
      attempts: 0,
    }
  );
}

/**
 * Проверяет, разблокирован ли уровень
 */
export function isLevelUnlocked(
  pack: Pack,
  level: PackLevel,
  progressMap: Record<string, LevelProgress>
): boolean {
  // Первый уровень всегда разблокирован
  if (!level.unlockRequirement.previousLevel) return true;

  // Проверяем прогресс предыдущего уровня
  const prevProgress = progressMap[level.unlockRequirement.previousLevel];
  if (!prevProgress) return false;

  // Разблокируется при достижении минимального количества звёзд
  return prevProgress.stars >= level.unlockRequirement.minStars;
}

/**
 * Применяет результаты игровой сессии к прогрессу
 * ИСПРАВЛЕНО: теперь учитываются ВСЕ слова из сессии
 */
export async function applySessionSummary(pack: Pack, summary: RunSummary): Promise<void> {
  // Определяем сложность уровня
  const levelDifficulty = summary.distractorMode ?? 'normal';
  
  // Создаём набор слов с ошибками
  const errorSet = new Set(summary.errors.map((e) => e.lexemeId));

  // ИСПРАВЛЕНО: обрабатываем все ответы из сессии
  if (summary.answers && summary.answers.length > 0) {
    // Группируем ответы по lexemeId (может быть несколько попыток на одно слово)
    const lexemeResults = new Map<string, boolean>();
    
    for (const answer of summary.answers) {
      // Слово считается правильным, если его НЕТ в списке ошибок
      const wasCorrect = !errorSet.has(answer.lexemeId);
      
      // Если уже есть результат для этого слова, берём лучший
      const existingResult = lexemeResults.get(answer.lexemeId);
      if (existingResult === undefined || (wasCorrect && !existingResult)) {
        lexemeResults.set(answer.lexemeId, wasCorrect);
      }
    }

    // Обновляем прогресс для каждого уникального слова
    for (const [lexemeId, wasCorrect] of lexemeResults.entries()) {
      await updateLexemeProgress(pack.id, lexemeId, wasCorrect, levelDifficulty);
    }
  }

  // Обновляем прогресс уровня
  await updateLevelProgress(pack.id, summary.levelId, summary.score, summary.accuracy);

  // Сохраняем сессию в историю
  const state = await loadProgress();
  if (!state.sessions) state.sessions = [];
  state.sessions.push({
    ...summary,
    timestamp: new Date().toISOString(),
  } as any);

  // Ограничиваем историю последними 100 сессиями
  state.sessions = state.sessions.slice(-100);

  await saveProgress(state);
}

/**
 * Получает сводку по прогрессу пака
 */
export async function getPackProgressSummary(pack: Pack): Promise<{
  mastered: number;
  total: number;
  completedLevels: number;
  totalLevels: number;
}> {
  const state = await loadProgress();
  const packProgress = state.packs[pack.id] ?? {};

  let mastered = 0;
  for (const lex of pack.lexemes) {
    const p = packProgress[lex.id];
    if (p && p.mastery >= 4) mastered++;
  }

  // Подсчёт завершённых уровней (3 звезды)
  let completedLevels = 0;
  const levelProgressMap = state.levelProgress?.[pack.id] ?? {};
  for (const level of pack.levels) {
    const lp = levelProgressMap[level.id];
    if (lp && lp.completed) completedLevels++;
  }

  return {
    mastered,
    total: pack.lexemes.length,
    completedLevels,
    totalLevels: pack.levels.length,
  };
}

/**
 * Получает список слов пака с их прогрессом
 */
export async function getPackLexemesWithProgress(pack: Pack): Promise<
  Array<{
    id: string;
    base: string;
    translation: string;
    mastery: number;
    recentMistakes: string[];
  }>
> {
  const state = await loadProgress();
  const packProgress = state.packs[pack.id] ?? {};

  return pack.lexemes.map((lex) => {
    const p = packProgress[lex.id] ?? { mastery: 0, recentMistakes: [] };
    return {
      id: lex.id,
      base: lex.base,
      translation: lex.translations[0] ?? '',
      mastery: p.mastery,
      recentMistakes: p.recentMistakes,
    };
  });
}
