/**
 * Генератор вопросов типа "form" (правильное написание)
 */

import type { Lexeme, SessionSlot } from '@/lib/types';
import { generateMisspelling } from '../utils';

export function buildFormSlot(
  lex: Lexeme,
  index: number,
  atSec: number,
  lanes: 2 | 3,
  allLexemes: Lexeme[],
  distractorMode: 'easy' | 'normal' | 'hard',
  rng: () => number
): SessionSlot {
  const correctWord = lex.base;
  const translation = lex.translations[0] ?? lex.base;

  let distractors: string[] = [];
  
  if (lex.distractors?.form) {
    distractors = [...lex.distractors.form];
  }

  while (distractors.length < lanes - 1) {
    const misspelled = generateMisspelling(correctWord, rng);
    if (misspelled !== correctWord && !distractors.includes(misspelled)) {
      distractors.push(misspelled);
    }
  }

  distractors = distractors.slice(0, lanes - 1);

  const options = [
    { id: correctWord, isCorrect: true },
    ...distractors.map((d) => ({ id: d, isCorrect: false })),
  ];

  options.sort(() => rng() - 0.5);

  return {
    index,
    atSec,
    lexemeId: lex.id,
    type: 'form',
    prompt: translation,
    options,
  };
}
