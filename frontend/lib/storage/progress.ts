/**
 * Модуль для работы с прогрессом пользователя (с константами)
 */

import {
  MASTERY_DECREASE_ON_ERROR,
  MASTERY_MAX,
  MASTERY_MULTIPLIERS,
  MAX_RECENT_MISTAKES,
  MAX_SESSIONS_HISTORY,
  MISTAKES_RETENTION_DAYS,
  STORAGE_KEYS
} from '@/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  LevelProgress,
  LexemeProgress,
  Pack,
  PackLevel,
  ProgressState,
  RunSummary,
} from '../types';

const PROGRESS_KEY = STORAGE_KEYS.PROGRESS;

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

  const multiplier = MASTERY_MULTIPLIERS[levelDifficulty] ?? MASTERY_MULTIPLIERS.normal;

  let newMastery = current.mastery;

  if (wasCorrect) {
    newMastery = Math.min(MASTERY_MAX, current.mastery + multiplier);
  } else {
    newMastery = Math.max(0, current.mastery - MASTERY_DECREASE_ON_ERROR);
  }

  let mistakes = [...current.recentMistakes];
  if (!wasCorrect) {
    mistakes.push(new Date().toISOString());
    mistakes = mistakes.slice(-MAX_RECENT_MISTAKES);
  } else {
    mistakes = mistakes.filter((m) => {
      const errorDate = new Date(m);
      const now = new Date();
      const daysDiff = (now.getTime() - errorDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff < MISTAKES_RETENTION_DAYS;
    });
  }

  state.packs[packId][lexemeId] = {
    mastery: Math.round(newMastery * 10) / 10,
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
  accuracy: number,
  stars: number 
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

  // Валидация stars
  const validStars = (stars === 0 || stars === 1 || stars === 2 || stars === 3) ? stars : 0;

  const updatedProgress: LevelProgress = {
    levelId,
    stars: Math.max(current.stars, validStars) as 0 | 1 | 2 | 3,
    bestScore: Math.max(current.bestScore, score),
    bestAccuracy: Math.max(current.bestAccuracy, accuracy),
    completed: validStars === 3 || current.completed,
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
  if (!level.unlockRequirement.previousLevel) return true;

  const prevProgress = progressMap[level.unlockRequirement.previousLevel];
  if (!prevProgress) return false;

  return prevProgress.stars >= level.unlockRequirement.minStars;
}

/**
 * Применяет результаты игровой сессии к прогрессу
 */
export async function applySessionSummary(pack: Pack, summary: RunSummary): Promise<void> {
  const levelDifficulty = summary.distractorMode ?? 'normal';
  const errorSet = new Set(summary.errors.map((e) => e.lexemeId));

  if (summary.answers && summary.answers.length > 0) {
    const lexemeResults = new Map<string, boolean>();
    
    for (const answer of summary.answers) {
      const wasCorrect = !errorSet.has(answer.lexemeId);
      
      const existingResult = lexemeResults.get(answer.lexemeId);
      if (existingResult === undefined || (wasCorrect && !existingResult)) {
        lexemeResults.set(answer.lexemeId, wasCorrect);
      }
    }

    for (const [lexemeId, wasCorrect] of lexemeResults.entries()) {
      await updateLexemeProgress(pack.id, lexemeId, wasCorrect, levelDifficulty);
    }
  }

  // Передаём stars из summary
  await updateLevelProgress(pack.id, summary.levelId, summary.score, summary.accuracy, summary.stars);

  const state = await loadProgress();
  if (!state.sessions) state.sessions = [];
  state.sessions.push({
    ...summary,
    timestamp: new Date().toISOString(),
  } as any);

  state.sessions = state.sessions.slice(-MAX_SESSIONS_HISTORY);

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
