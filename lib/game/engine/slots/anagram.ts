/**
 * Генератор вопросов типа "anagram" (анаграмма)
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
  
  const wordLetters = correctWord.split('');
  const extraLettersCount = Math.floor(rng() * 3) + 3;
  const allPossibleLetters = 'abcdefghijklmnopqrstuvwxyz';
  const extraLetters: string[] = [];
  
  for (let i = 0; i < extraLettersCount; i++) {
    const randomLetter = allPossibleLetters[Math.floor(rng() * allPossibleLetters.length)];
    extraLetters.push(randomLetter);
  }
  
  const allLetters = [...wordLetters, ...extraLetters];
  const shuffledLetters = allLetters.sort(() => rng() - 0.5);

  return {
    index,
    atSec,
    lexemeId: lex.id,
    type: 'anagram',
    prompt: translation,
    options: [],
    letters: shuffledLetters,
    correctAnswer: correctWord.toLowerCase(),
  };
}
