/**
 * Главный генератор игровых сессий
 */

import type { LevelConfig, Pack, QuestionType, SessionPlan, SessionSlot } from '@/lib/types';
import { buildAnagramSlot, buildContextSlot, buildFormSlot, buildMeaningSlot } from './slots';
import { seededRandom } from './utils';

/**
 * Генерирует один слот
 */
function buildSlot(
  lex: any,
  index: number,
  lanes: 2 | 3,
  types: QuestionType[],
  allLexemes: any[],
  distractorMode: 'easy' | 'normal' | 'hard',
  rng: () => number
): SessionSlot | null {
  const type = types[Math.floor(rng() * types.length)];

  switch (type) {
    case 'anagram':
      return buildAnagramSlot(lex, index, 0, rng);
    
    case 'context':
      return buildContextSlot(lex, index, 0, rng);
    
    case 'form':
      return buildFormSlot(lex, index, 0, lanes, allLexemes, distractorMode, rng);
    
    case 'meaning':
    default:
      return buildMeaningSlot(lex, index, 0, lanes, allLexemes, distractorMode, rng);
  }
}

/**
 * Строит план игровой сессии
 */
export function buildSessionPlan(params: {
  pack: Pack;
  level: LevelConfig;
  seed: string;
  restrictLexemes?: string[];
  distractorMode?: 'easy' | 'normal' | 'hard';
}): SessionPlan {
  const { pack, level, seed, restrictLexemes, distractorMode = 'normal' } = params;
  const rng = seededRandom(seed);

  let lexPool = [...pack.lexemes];
  if (restrictLexemes && restrictLexemes.length > 0) {
    lexPool = lexPool.filter((l) => restrictLexemes.includes(l.id));
  }

  if (lexPool.length === 0) {
    lexPool = [...pack.lexemes];
  }

  const slots: SessionSlot[] = [];
  
  // Генерируем слоты для всех слов из пула
  for (let i = 0; i < lexPool.length; i++) {
    let slot: SessionSlot | null = null;
    let attempts = 0;
    
    while (slot === null && attempts < 10) {
      const lex = lexPool[i];
      slot = buildSlot(lex, i, level.lanes, level.allowedTypes, pack.lexemes, distractorMode, rng);
      attempts++;
    }
    
    if (slot) {
      slots.push(slot);
    }
  }

  return { seed, slots };
}
