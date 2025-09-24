import { hashStringToSeed, mulberry32, RNG, shuffleInPlace, weightedSampleIndex } from './random';
import type { DistractorMode, LevelConfig, Pack, QuestionType, SessionPlan, SessionSlot } from './types';

// Приоритезация: низкое mastery и недавние ошибки вверх, но 20–30% «выученных»
function buildLexemeQueue(pack: Pack, rng: RNG, lanes: 2 | 3, totalSlots: number): string[] {
  const learned = pack.lexemes.filter(lx => (lx.mastery ?? 0) >= 4);
  const learning = pack.lexemes.filter(lx => (lx.mastery ?? 0) < 4);

  const learnedTarget = Math.max(0, Math.min(totalSlots, Math.round(totalSlots * (0.2 + rng() * 0.1))));
  const queue: string[] = [];

  const weightsLearning = learning.map(lx => {
    const m = lx.mastery ?? 0;
    const recent = (lx.recentMistakes?.length ?? 0);
    return (5 - m) * 2 + Math.min(recent, 3) * 3 + 1;
  });

  while (queue.length < totalSlots) {
    const needLearned = queue.length < learnedTarget ? (rng() < 0.5) : false;
    if (needLearned && learned.length > 0) {
      const idx = Math.floor(rng() * learned.length);
      queue.push(learned[idx].id);
    } else {
      if (learning.length === 0) {
        const idx = Math.floor(rng() * (learned.length || 1));
        queue.push((learned[idx] ?? learned[0]).id);
      } else {
        const idx = weightedSampleIndex(weightsLearning, rng);
        queue.push(learning[idx].id);
      }
    }
  }

  for (let i = 1; i < queue.length; i++) {
    if (queue[i] === queue[i - 1] && pack.lexemes.length > 1) {
      for (let j = i + 1; j < queue.length; j++) {
        if (queue[j] !== queue[i]) {
          [queue[i], queue[j]] = [queue[j], queue[i]];
          break;
        }
      }
    }
  }
  return queue;
}

// 🔹 подмешиваем сложность дистракторов
function makeMeaningOptions(
  pack: Pack,
  lexemeId: string,
  lanes: 2 | 3,
  rng: RNG,
  mode: DistractorMode = 'normal'
) {
  const lx = pack.lexemes.find(l => l.id === lexemeId)!;
  const correct = lx.translations[0] ?? '';

  const own = (lx.distractors?.meaning ?? []).filter(d => d !== correct);
  const others = pack.lexemes
    .filter(o => o.id !== lexemeId)
    .map(o => o.translations[0])
    .filter(Boolean)
    .filter(t => t !== correct) as string[];

  shuffleInPlace(others, rng);
  shuffleInPlace(own, rng);

  let pool: string[] = [];
  if (mode === 'hard') {
    // приоритет — собственные (похожее), если не хватило — добираем из других
    pool = [...own, ...others];
  } else if (mode === 'easy') {
    // наоборот — сначала случайные другие (менее похожие), затем свои
    pool = [...others, ...own];
  } else {
    // normal — перемешанный микс
    pool = shuffleInPlace([...own, ...others], rng);
  }

  // выкинуть дубликаты
  const seen = new Set<string>();
  const unique = pool.filter(t => {
    if (seen.has(t)) return false;
    seen.add(t);
    return true;
  });

  const chosenDistractors = unique.slice(0, Math.max(0, lanes - 1));
  const raw = [{ id: correct, isCorrect: true }, ...chosenDistractors.map(d => ({ id: d, isCorrect: false }))];
  const shuffled = shuffleInPlace(raw, rng);
  return { prompt: lx.base, options: shuffled };
}

/** Построение плана; поддержка restrictLexemes и distractorMode */
export function buildSessionPlan(params: {
  pack: Pack;
  level: LevelConfig;
  seed: string;
  restrictLexemes?: string[];
  distractorMode?: DistractorMode; // 🔹 новое
}): SessionPlan {
  const { pack, level, seed, restrictLexemes, distractorMode = 'normal' } = params;

  const rng = mulberry32(hashStringToSeed(`${seed}::${pack.id}::${level.durationSec}/${level.forkEverySec}/${level.lanes}/${distractorMode}`));
  const type: QuestionType = 'meaning';

  let queue: string[] = [];
  if (restrictLexemes && restrictLexemes.length > 0) {
    const allowed = new Set(pack.lexemes.map(l => l.id));
    queue = restrictLexemes.filter(id => allowed.has(id));
  } else {
    const slotsCount = pack.lexemes.length;
    queue = buildLexemeQueue(pack, rng, level.lanes, slotsCount);
  }

  const slots: SessionSlot[] = [];
  const slotsCountFinal = queue.length;
  for (let i = 0; i < slotsCountFinal; i++) {
    const lexemeId = queue[i % queue.length];
    const atSec = Math.round((i + 1) * level.forkEverySec);
    const { prompt, options } = makeMeaningOptions(pack, lexemeId, level.lanes, rng, distractorMode);

    slots.push({ index: i, atSec, lexemeId, type, prompt, options });
  }

  return {
    seed,
    slots,
    summary: {
      totalSlots: slotsCountFinal,
      lanes: level.lanes,
      forkEverySec: level.forkEverySec,
      durationSec: level.durationSec,
      packId: pack.id,
    },
  };
}
