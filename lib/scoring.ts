export type ScoreState = {
  score: number;
  combo: number;      // длина серии
  comboMul: number;   // множитель (1.0 .. 3.0)
  correct: number;
  total: number;
  errors: string[];   // lexemeId с ошибкой
};

export const defaultScore = (): ScoreState => ({
  score: 0,
  combo: 0,
  comboMul: 1,
  correct: 0,
  total: 0,
  errors: [],
});

export function applyAnswer(state: ScoreState, isCorrect: boolean, lexemeId: string): ScoreState {
  const next = { ...state, total: state.total + 1 };
  if (isCorrect) {
    const combo = next.combo + 1;
    const comboMul = Math.min(3, parseFloat((1 + combo * 0.1).toFixed(2))); // +10%/ответ, до ×3
    const add = Math.round(100 * comboMul);
    next.score += add;
    next.combo = combo;
    next.comboMul = comboMul;
    next.correct += 1;
  } else {
    next.combo = 0;
    next.comboMul = 1;
    next.errors = [...next.errors, lexemeId];
  }
  return next;
}

// Бонус за «пустое» оставшееся время (когда слова кончились)
export function applyTimeBonus(state: ScoreState, perSecond = 50): ScoreState {
  return { ...state, score: state.score + perSecond };
}
