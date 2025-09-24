import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DistractorMode, LevelConfig, LexemeProgress, Pack, PackAdaptive, ProgressState, RunSummary } from './types';

const PROGRESS_KEY = 'sr/progress/v1'; // схему не меняем

const emptyState: ProgressState = { packs: {}, sessions: [], adaptive: {} };

export async function loadProgress(): Promise<ProgressState> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...emptyState };
    const parsed = JSON.parse(raw) as ProgressState;
    return {
      packs: parsed.packs ?? {},
      sessions: parsed.sessions ?? [],
      adaptive: parsed.adaptive ?? {},
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

export async function getPackProgressSummary(pack: Pack): Promise<{ mastered: number; total: number }> {
  const st = await loadProgress();
  const byPack = st.packs[pack.id] ?? {};
  const total = pack.lexemes.length;
  const mastered = pack.lexemes.reduce((acc, lx) => {
    const p = byPack[lx.id];
    const mastery = p?.mastery ?? lx.mastery ?? 0;
    return acc + (mastery >= 4 ? 1 : 0);
  }, 0);
  return { mastered, total };
}

/** 🔹 обновляем/создаём adaptive-метрики по паку */
function updateAdaptiveForPack(st: ProgressState, packId: string, summary: RunSummary, windowSize = 50) {
  if (!st.adaptive) st.adaptive = {};
  const cur: PackAdaptive = st.adaptive[packId] ?? { lastSessionAccuracy: 0, lastAnswersWindow: [], windowSize };

  cur.lastSessionAccuracy = summary.accuracy;

  // пополняем окно 0/1 из answers; если answers нет — грубая эвристика
  const batch: number[] = [];
  if (summary.answers && summary.answers.length > 0) {
    for (const a of summary.answers) {
      const okFirstTry = a.attempts <= 1; // «в первой попытке»
      batch.push(okFirstTry ? 1 : 0);
    }
  } else {
    // эвристика: то, что в errors → 0; остальное → 1
    const errorSet = new Set(summary.errors.map(e => e.lexemeId));
    // попробовать оценить по длительности сессии нельзя — берём равное количество слотов лексем
    for (const e of errorSet) batch.push(0);
    if (batch.length === 0) batch.push(1); // пустой случай — хотя бы один «успех»
  }

  const merged = [...cur.lastAnswersWindow, ...batch];
  cur.lastAnswersWindow = merged.slice(-windowSize);
  cur.windowSize = windowSize;

  st.adaptive[packId] = cur;
}

/** 🔹 вычислить рекомендуемые параметры на следующую сессию */
export function getRecommendedLevelNext(base: LevelConfig, adaptive?: PackAdaptive): {
  level: LevelConfig;
  distractorMode: DistractorMode;
} {
  let fork = base.forkEverySec;
  let lanes: 2 | 3 = base.lanes;
  let mode: DistractorMode = 'normal';

  const accLast = adaptive?.lastSessionAccuracy ?? 0;
  const accWindow = (adaptive?.lastAnswersWindow?.length ?? 0) > 0
    ? (adaptive!.lastAnswersWindow.reduce((a, b) => a + b, 0) / adaptive!.lastAnswersWindow.length)
    : accLast;

  const acc = (accLast * 0.6 + accWindow * 0.4);

  if (acc >= 0.85) {
    fork = Math.max(1.5, +(fork - 0.25).toFixed(2));
    mode = 'hard';
    // lanes = 3; // включишь после MVP
  } else if (acc <= 0.60) {
    fork = Math.min(4.0, +(fork + 0.25).toFixed(2));
    mode = 'easy';
    lanes = 2;
  } else {
    mode = 'normal';
  }

  return { level: { ...base, forkEverySec: fork, lanes }, distractorMode: mode };
}

/**
 * Записать прогресс по результатам сессии (Этап 5 + адаптация)
 * — обновляем mastery ТОЛЬКО для encountered (как у тебя сейчас)
 * — дополняем adaptive-метрики и сохраняем
 */
export async function applySessionSummary(pack: Pack, summary: RunSummary): Promise<void> {
  const st = await loadProgress();
  if (!st.packs[pack.id]) st.packs[pack.id] = {};
  const byPack = st.packs[pack.id];

  const nowIso = new Date().toISOString();

  // ====== Этап 5: обновление mastery по encountered (твой текущий алгоритм) ======
  const encounteredSet = new Set<string>();
  const hadErrorMap = new Map<string, boolean>();

  if (summary.answers && summary.answers.length > 0) {
    for (const a of summary.answers) {
      encounteredSet.add(a.lexemeId);
      const hadErr = (a.attempts ?? 1) > 1 || (a.isCorrect === false);
      if (hadErr) hadErrorMap.set(a.lexemeId, true);
    }
  } else {
    for (const lx of pack.lexemes) encounteredSet.add(lx.id);
    const errorIds = new Set(summary.errors.map(e => e.lexemeId));
    for (const id of errorIds) hadErrorMap.set(id, true);
  }

  for (const lexemeId of encounteredSet) {
    const lx = pack.lexemes.find(l => l.id === lexemeId);
    if (!lx) continue;

    const cur: LexemeProgress = byPack[lexemeId] ?? { mastery: lx.mastery ?? 0, recentMistakes: [] };
    const hadErr = hadErrorMap.get(lexemeId) === true;

    if (hadErr) {
      cur.mastery = Math.max(0, Math.min(5, (cur.mastery ?? 0) - 1));
      cur.recentMistakes = [...(cur.recentMistakes ?? []), nowIso].slice(-5);
    } else {
      cur.mastery = Math.max(0, Math.min(5, (cur.mastery ?? 0) + 1));
    }

    byPack[lexemeId] = cur;
  }

  // ====== История (как было) ======
  const errorSet = new Set(summary.errors.map(e => e.lexemeId));
  st.sessions.push({
    id: `${summary.packId}:${nowIso}`,
    packId: summary.packId,
    score: summary.score,
    accuracy: summary.accuracy,
    durationSec: summary.durationPlayedSec,
    endedAt: nowIso,
    errors: Array.from(errorSet),
  });
  if (st.sessions.length > 100) st.sessions.splice(0, st.sessions.length - 100);

  // ====== 🔹 Адаптация: обновляем метрики ======
  updateAdaptiveForPack(st, pack.id, summary, 50);

  await saveProgress(st);
}

/** 🔹 получить адаптивные метрики для packId */
export async function getPackAdaptive(packId: string): Promise<PackAdaptive | undefined> {
  const st = await loadProgress();
  return st.adaptive?.[packId];
}

export async function getPackLexemesWithProgress(pack: Pack): Promise<
  Array<{ id: string; base: string; translation: string; mastery: number; recentMistakes: string[] }>
> {
  const st = await loadProgress();
  const byPack = st.packs[pack.id] ?? {};
  return pack.lexemes.map(lx => ({
    id: lx.id,
    base: lx.base,
    translation: lx.translations[0] ?? '',
    mastery: byPack[lx.id]?.mastery ?? lx.mastery ?? 0,
    recentMistakes: byPack[lx.id]?.recentMistakes ?? lx.recentMistakes ?? [],
  }));
}
