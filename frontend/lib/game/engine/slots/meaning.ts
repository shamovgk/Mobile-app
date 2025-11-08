/**
 * Генератор вопросов типа "meaning" (перевод)
 */

import type { Lexeme, SessionSlot } from '@/lib/types';

export function buildMeaningSlot(
  lex: Lexeme,
  index: number,
  atSec: number,
  lanes: 2 | 3,
  allLexemes: Lexeme[],
  distractorMode: 'easy' | 'normal' | 'hard',
  rng: () => number
): SessionSlot {
  const correctTranslation = lex.translations[0] ?? lex.base;

  let distractors: string[] = [];
  if (distractorMode === 'easy' && lex.distractors?.meaning) {
    distractors = lex.distractors.meaning.slice(0, lanes - 1);
  }

  if (distractors.length < lanes - 1) {
    const pool = allLexemes
      .filter((l) => l.id !== lex.id)
      .map((l) => l.translations[0] ?? l.base);
    
    const needed = lanes - 1 - distractors.length;
    const shuffled = pool.sort(() => rng() - 0.5);
    distractors = [...distractors, ...shuffled.slice(0, needed)];
  }

  const options = [
    { id: correctTranslation, isCorrect: true },
    ...distractors.map((d) => ({ id: d, isCorrect: false })),
  ];

  options.sort(() => rng() - 0.5);

  return {
    index,
    atSec,
    lexemeId: lex.id,
    type: 'meaning',
    prompt: lex.base,
    options,
  };
}
