/**
 * Модуль для работы с AsyncStorage - персистентное хранилище прогресса
 * С поддержкой системы уровней
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DistractorMode, LevelConfig, LevelProgress, LexemeProgress, Pack, PackAdaptive, PackLevel, ProgressState, RunSummary } from './types';

const PROGRESS_KEY = 'sr:progress:v1';

const emptyState: ProgressState = {
  packs: {},
  sessions: [],
  adaptive: {},
  levelProgress: {},
};

export async function loadProgress(): Promise<ProgressState> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...emptyState };

    const parsed = JSON.parse(raw) as ProgressState;
    return {
      packs: parsed.packs ?? {},
      sessions: parsed.sessions ?? [],
      adaptive: parsed.adaptive ?? {},
      levelProgress: parsed.levelProgress ?? {},
    };
  } catch {
    return { ...emptyState };
  }
}

async function saveProgress(state: ProgressState): Promise<void> {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
}

export async function resetProgress(): Promise<void> {
  await AsyncStorage.removeItem(PROGRESS_KEY);
}

/**
 * Получает прогресс по конкретному уровню
 */
export async function getLevelProgress(packId: string, levelId: string): Promise<LevelProgress> {
  const st = await loadProgress();
  if (!st.levelProgress) st.levelProgress = {};
  if (!st.levelProgress[packId]) st.levelProgress[packId] = {};

  return (
    st.levelProgress[packId][levelId] ?? {
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
    stars: Math.max(current.stars, newStars) as 0 | 1 | 2 | 3, // ← Исправление: добавлен as
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
 * Получает сводку по прогрессу пака (для главного экрана)
 */
export async function getPackProgressSummary(pack: Pack): Promise<{ mastered: number; total: number; completedLevels: number; totalLevels: number }> {
  const st = await loadProgress();
  const byPack = st.packs[pack.id] ?? {};

  const total = pack.lexemes.length;
  const mastered = pack.lexemes.reduce((acc, lx) => {
    const p = byPack[lx.id];
    const mastery = p?.mastery ?? lx.mastery ?? 0;
    return acc + (mastery >= 4 ? 1 : 0);
  }, 0);

  // Подсчёт завершённых уровней (3★)
  const levelProgressMap = st.levelProgress?.[pack.id] ?? {};
  const completedLevels = Object.values(levelProgressMap).filter((p: LevelProgress) => p.completed).length;
  const totalLevels = pack.levels.length;

  return { mastered, total, completedLevels, totalLevels };
}

function updateAdaptiveForPack(st: ProgressState, packId: string, summary: RunSummary, windowSize = 50) {
  if (!st.adaptive) st.adaptive = {};

  const cur: PackAdaptive = st.adaptive[packId] ?? {
    lastSessionAccuracy: 0,
    lastAnswersWindow: [],
    windowSize,
  };

  cur.lastSessionAccuracy = summary.accuracy;

  const batch: number[] = [];

  if (summary.answers && summary.answers.length > 0) {
    for (const a of summary.answers) {
      const okFirstTry = a.attempts === 1;
      batch.push(okFirstTry ? 1 : 0);
    }
  } else {
    const errorSet = new Set(summary.errors.map((e) => e.lexemeId));
    for (const e of errorSet) {
      batch.push(0);
    }
  }

  if (batch.length === 0) batch.push(1);

  const merged = [...cur.lastAnswersWindow, ...batch];
  cur.lastAnswersWindow = merged.slice(-windowSize);
  cur.windowSize = windowSize;

  st.adaptive[packId] = cur;
}

export function getRecommendedLevelNext(
  base: LevelConfig,
  adaptive?: PackAdaptive
): { level: LevelConfig; distractorMode: DistractorMode } {
  let fork = base.forkEverySec;
  let lanes: 2 | 3 = base.lanes;
  let mode: DistractorMode = 'normal';

  const accLast = adaptive?.lastSessionAccuracy ?? 0;
  const accWindow =
    adaptive?.lastAnswersWindow?.length ?? 0 > 0
      ? adaptive!.lastAnswersWindow.reduce((a, b) => a + b, 0) / adaptive!.lastAnswersWindow.length
      : accLast;

  const acc = accLast * 0.6 + accWindow * 0.4;

  if (acc > 0.85) {
    fork = Math.max(1.5, parseFloat((fork - 0.25).toFixed(2)));
    mode = 'hard';
    lanes = 3;
  } else if (acc < 0.60) {
    fork = Math.min(4.0, parseFloat((fork + 0.25).toFixed(2)));
    mode = 'easy';
    lanes = 2;
  } else {
    mode = 'normal';
  }

  return {
    level: { ...base, forkEverySec: fork, lanes },
    distractorMode: mode,
  };
}

export async function applySessionSummary(pack: Pack, summary: RunSummary): Promise<void> {
  const st = await loadProgress();

  if (!st.packs[pack.id]) st.packs[pack.id] = {};
  const byPack = st.packs[pack.id];

  const nowIso = new Date().toISOString();

  const encounteredSet = new Set<string>();
  const hadErrorMap = new Map<string, boolean>();

  if (summary.answers && summary.answers.length > 0) {
    for (const a of summary.answers) {
      encounteredSet.add(a.lexemeId);
      const hadErr = (a.attempts ?? 1) > 1 || a.isCorrect === false;
      if (hadErr) hadErrorMap.set(a.lexemeId, true);
    }
  } else {
    for (const lx of pack.lexemes) {
      encounteredSet.add(lx.id);
    }

    const errorIds = new Set(summary.errors.map((e) => e.lexemeId));
    for (const id of errorIds) {
      hadErrorMap.set(id, true);
    }
  }

  for (const lexemeId of encounteredSet) {
    const lx = pack.lexemes.find((l) => l.id === lexemeId);
    if (!lx) continue;

    const cur: LexemeProgress = byPack[lexemeId] ?? {
      mastery: lx.mastery ?? 0,
      recentMistakes: [],
    };

    const hadErr = hadErrorMap.get(lexemeId) === true;

    if (hadErr) {
      cur.mastery = Math.max(0, Math.min(5, (cur.mastery ?? 0) - 1));
      cur.recentMistakes = [...(cur.recentMistakes ?? []), nowIso].slice(-5);
    } else {
      cur.mastery = Math.max(0, Math.min(5, (cur.mastery ?? 0) + 1));
    }

    byPack[lexemeId] = cur;
  }

  const errorSet = new Set(summary.errors.map((e) => e.lexemeId));
  st.sessions.push({
    id: `${summary.packId}:${summary.levelId}:${nowIso}`,
    packId: summary.packId,
    levelId: summary.levelId,
    score: summary.score,
    accuracy: summary.accuracy,
    durationSec: summary.durationPlayedSec,
    endedAt: nowIso,
    errors: Array.from(errorSet),
  });

  if (st.sessions.length > 100) {
    st.sessions.splice(0, st.sessions.length - 100);
  }

  updateAdaptiveForPack(st, pack.id, summary, 50);

  // Обновляем прогресс уровня
  await updateLevelProgress(summary.packId, summary.levelId, summary.score, summary.accuracy);

  await saveProgress(st);
}

export async function getPackAdaptive(packId: string): Promise<PackAdaptive | undefined> {
  const st = await loadProgress();
  return st.adaptive?.[packId];
}

export async function getPackLexemesWithProgress(
  pack: Pack
): Promise<Array<{ id: string; base: string; translation: string; mastery: number; recentMistakes: string[] }>> {
  const st = await loadProgress();
  const byPack = st.packs[pack.id] ?? {};

  return pack.lexemes.map((lx) => ({
    id: lx.id,
    base: lx.base,
    translation: lx.translations[0] ?? '',
    mastery: byPack[lx.id]?.mastery ?? lx.mastery ?? 0,
    recentMistakes: byPack[lx.id]?.recentMistakes ?? lx.recentMistakes ?? [],
  }));
}
