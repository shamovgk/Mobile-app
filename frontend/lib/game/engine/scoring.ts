/**
 * Система подсчёта очков (С КОМБО)
 */

import type { ScoreState } from '@/lib/types';

export const defaultScore: ScoreState = {
  score: 0,
  combo: 0,
  comboMax: 0,
  correct: 0,
  total: 0,
  errors: [],
};

/**
 * Применяет результат ответа к счёту
 */
export function applyAnswer(
  state: ScoreState,
  isCorrect: boolean,
  lexemeId: string
): ScoreState {
  const newTotal = state.total + 1;
  const newCorrect = state.correct + (isCorrect ? 1 : 0);
  
  // Комбо: каждый правильный ответ подряд увеличивает комбо
  let newCombo = isCorrect ? state.combo + 1 : 0;
  let newComboMax = Math.max(state.comboMax, newCombo);
  
  // Бонус за комбо (каждые 3 правильных подряд)
  const comboBonus = newCombo >= 3 ? Math.floor(newCombo / 3) * 5 : 0;
  const basePoints = isCorrect ? 10 : 0;
  const newScore = state.score + basePoints + comboBonus;
  
  const newErrors = isCorrect 
    ? state.errors 
    : [...state.errors, lexemeId];

  return {
    score: newScore,
    combo: newCombo,
    comboMax: newComboMax,
    correct: newCorrect,
    total: newTotal,
    errors: newErrors,
  };
}
