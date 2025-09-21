import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LexemeProgress, Pack, ProgressState, RunSummary } from './types';

const PROGRESS_KEY = 'sr/progress/v1';

const emptyState: ProgressState = { packs: {}, sessions: [] };

export async function loadProgress(): Promise<ProgressState> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...emptyState };
    const parsed = JSON.parse(raw) as ProgressState;
    // базовая защита
    return {
      packs: parsed.packs ?? {},
      sessions: parsed.sessions ?? [],
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

export async function getPackProgressSummary(pack: Pack): Promise<{
  mastered: number;
  total: number;
}> {
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

// Записать прогресс по результатам сессии
export async function applySessionSummary(pack: Pack, summary: RunSummary): Promise<void> {
  const st = await loadProgress();
  if (!st.packs[pack.id]) st.packs[pack.id] = {};
  const byPack = st.packs[pack.id];

  const nowIso = new Date().toISOString();

  // Обновляем mastery: +1 за верно, -1 за ошибку, клип 0..5
  // Здесь у нас нет покадровых ответов, только список ошибок → предполагаем, что прочее верно.
  // Минимальная логика для MVP:
  const errorSet = new Set(summary.errors.map(e => e.lexemeId));

  for (const lx of pack.lexemes) {
    const cur: LexemeProgress = byPack[lx.id] ?? { mastery: lx.mastery ?? 0, recentMistakes: [] };
    if (errorSet.has(lx.id)) {
      cur.mastery = Math.max(0, Math.min(5, (cur.mastery ?? 0) - 1));
      cur.recentMistakes = [...(cur.recentMistakes ?? []), nowIso].slice(-5);
    } else {
      // «верно без подсказки» как дефолт
      cur.mastery = Math.max(0, Math.min(5, (cur.mastery ?? 0) + 1));
    }
    byPack[lx.id] = cur;
  }

  st.sessions.push({
    id: `${summary.packId}:${nowIso}`,
    packId: summary.packId,
    score: summary.score,
    accuracy: summary.accuracy,
    durationSec: summary.durationPlayedSec,
    endedAt: nowIso,
    errors: Array.from(errorSet),
  });

  // держим историю короткой
  if (st.sessions.length > 100) st.sessions.splice(0, st.sessions.length - 100);

  await saveProgress(st);
}

export async function getPackLexemesWithProgress(pack: Pack): Promise<
  Array<{
    id: string;
    base: string;
    translation: string;
    mastery: number;
    recentMistakes: string[];
  }>
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
