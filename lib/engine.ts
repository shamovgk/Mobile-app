import { hashStringToSeed, mulberry32, RNG, shuffleInPlace, weightedSampleIndex } from './random';
import type { LevelConfig, Pack, QuestionType, SessionPlan, SessionSlot } from './types';

// Приоритезация: низкое mastery и недавние ошибки вверх, но 20–30% «выученных» для перемешивания.
function buildLexemeQueue(pack: Pack, rng: RNG, lanes: 2 | 3, totalSlots: number): string[] {
  const learned = pack.lexemes.filter(lx => (lx.mastery ?? 0) >= 4);
  const learning = pack.lexemes.filter(lx => (lx.mastery ?? 0) < 4);

  const learnedTarget = Math.max(0, Math.min(totalSlots, Math.round(totalSlots * (0.2 + rng() * 0.1))));

  const queue: string[] = [];

  // веса для learning: ниже mastery + есть ошибки => больше шанс
  const weightsLearning = learning.map(lx => {
    const m = lx.mastery ?? 0;
    const recent = (lx.recentMistakes?.length ?? 0);
    return (5 - m) * 2 + Math.min(recent, 3) * 3 + 1; // 1..(условно 15+)
  });

  // веса для learned: низкий приоритет, но не нулевой
  const weightsLearned = learned.map(lx => 1);

  // helper
  const takeFrom = (arr: typeof learning | typeof learned, weights: number, count: number) => {
    // заглушка — будем брать по одному с обновлением весов (простая стохастика без повторов подряд одного и того же)
  };

  // Набиваем очередь длиной totalSlots
  while (queue.length < totalSlots) {
    const needLearned = queue.length < learnedTarget ? (rng() < 0.5) : false;

    if (needLearned && learned.length > 0) {
      // выбор выученного равновероятно
      const idx = Math.floor(rng() * learned.length);
      queue.push(learned[idx].id);
    } else {
      if (learning.length === 0) {
        // fallback — если внезапно все выучены
        const idx = Math.floor(rng() * (learned.length || 1));
        queue.push((learned[idx] ?? learned[0]).id);
      } else {
        const idx = weightedSampleIndex(weightsLearning, rng);
        queue.push(learning[idx].id);
      }
    }
  }

  // избегаем повторов одного и того же подряд, если возможно
  for (let i = 1; i < queue.length; i++) {
    if (queue[i] === queue[i - 1] && pack.lexemes.length > 1) {
      // найдём другой индекс
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

function makeMeaningOptions(pack: Pack, lexemeId: string, lanes: 2 | 3, rng: RNG) {
  const lx = pack.lexemes.find(l => l.id === lexemeId)!;
  const correct = lx.translations[0] ?? '';
  // сначала берём дистракторы из самого лексема
  let pool = (lx.distractors?.meaning ?? []).filter(d => d !== correct);

  // если не хватает — добираем переводами из других лексем
  if (pool.length < (lanes - 1)) {
    const others = pack.lexemes
      .filter(o => o.id !== lexemeId)
      .map(o => o.translations[0])
      .filter(Boolean) as string[];

    // уникальные, без correct
    const extra = others.filter(t => t !== correct && !pool.includes(t));
    shuffleInPlace(extra, rng);
    pool = pool.concat(extra);
  }

  const chosenDistractors = pool.slice(0, Math.max(0, lanes - 1));
  const raw = [ { id: correct, isCorrect: true }, ...chosenDistractors.map(d => ({ id: d, isCorrect: false })) ];

  // перетасуем, чтобы позиция правильного менялась
  const shuffled = shuffleInPlace(raw, rng);
  return { prompt: lx.base, options: shuffled };
}

export function buildSessionPlan(params: {
  pack: Pack;
  level: LevelConfig;
  seed: string;
}): SessionPlan {
  const { pack, level, seed } = params;
  const slotsCount = Math.max(1, Math.floor(level.durationSec / level.forkEverySec));
  const rng = mulberry32(hashStringToSeed(`${seed}::${pack.id}::${level.durationSec}/${level.forkEverySec}/${level.lanes}`));

  const queue = buildLexemeQueue(pack, rng, level.lanes, slotsCount);

  const type: QuestionType = 'meaning'; // MVP

  const slots: SessionSlot[] = [];
  for (let i = 0; i < slotsCount; i++) {
    const lexemeId = queue[i % queue.length];
    const atSec = Math.round((i + 1) * level.forkEverySec); // момент появления

    const { prompt, options } = makeMeaningOptions(pack, lexemeId, level.lanes, rng);

    slots.push({
      index: i,
      atSec,
      lexemeId,
      type,
      prompt,
      options,
    });
  }

  return {
    seed,
    slots,
    summary: {
      totalSlots: slotsCount,
      lanes: level.lanes,
      forkEverySec: level.forkEverySec,
      durationSec: level.durationSec,
      packId: pack.id,
    },
  };
}
