/**
 * Генератор вопросов типа "context" (контекст)
 */

import type { Lexeme, SessionSlot } from '@/lib/types';

export function buildContextSlot(
  lex: Lexeme,
  index: number,
  atSec: number,
  rng: () => number
): SessionSlot | null {
  const singularForm = lex.base;
  const pluralForm = lex.forms?.plural || lex.base + 's';
  
  if (singularForm.toLowerCase() === pluralForm.toLowerCase()) {
    return null;
  }

  const usePlural = rng() > 0.5;
  
  let example: string;
  if (usePlural) {
    example = lex.examplesPlural?.[0] || `I like ${pluralForm}.`;
  } else {
    example = lex.examples?.[0] || `I like ${singularForm}.`;
  }

  const correctForm = usePlural ? pluralForm : singularForm;
  const pattern = new RegExp(`\\b${singularForm}(s|es)?\\b`, 'gi');
  const contextWithGap = example.replace(pattern, '___');
  const words = [singularForm, pluralForm].sort(() => rng() - 0.5);

  return {
    index,
    atSec,
    lexemeId: lex.id,
    type: 'context',
    prompt: contextWithGap,
    options: [],
    words: words,
    correctAnswer: correctForm.toLowerCase(),
    context: example,
  };
}
