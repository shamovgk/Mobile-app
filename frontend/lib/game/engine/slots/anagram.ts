/**
 * Генератор вопросов типа "anagram" (ИСПРАВЛЕН)
 */

import type { Lexeme, SessionSlot } from '@/lib/types';

export function buildAnagramSlot(
  lex: Lexeme,
  index: number,
  atSec: number,
  rng: () => number
): SessionSlot {
  const correctWord = lex.base;
  const translation = lex.translations[0] ?? lex.base;
  
  // Перемешать буквы слова
  const wordLetters = correctWord.split('');
  const shuffledLetters = [...wordLetters].sort(() => rng() - 0.5);

  return {
    index,
    atSec,
    lexemeId: lex.id,
    type: 'anagram',
    prompt: translation,
    options: [{ id: correctWord, isCorrect: true }],
    letters: shuffledLetters,
    correctAnswer: correctWord.toLowerCase(),
  };
}
