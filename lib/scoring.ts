/**
 * Модуль системы подсчёта очков и комбо
 * 
 * Механики:
 * - Базовые очки за правильный ответ: 100
 * - Комбо-мультипликатор: 1.0 → 1.1 → 1.2 → ... → 3.0 (максимум)
 * - Сброс комбо при ошибке
 * - Трекинг правильных/неправильных ответов
 * - Список ошибок для SRS
 */

export type ScoreState = {
  score: number; // Текущий счёт
  combo: number; // Текущая серия правильных ответов
  comboMul: number; // Мультипликатор комбо (1.0 .. 3.0)
  correct: number; // Количество правильных ответов
  total: number; // Общее количество ответов
  errors: string[]; // Список lexemeId с ошибками
};

/**
 * Начальное состояние счёта
 */
export const defaultScore: ScoreState = {
  score: 0,
  combo: 0,
  comboMul: 1,
  correct: 0,
  total: 0,
  errors: [],
};

/**
 * Применяет результат ответа к состоянию счёта
 * 
 * Логика:
 * - Правильный ответ:
 *   - Увеличение combo на 1
 *   - Расчёт мультипликатора: min(3.0, 1.0 + combo * 0.1)
 *   - Начисление очков: round(100 * comboMul)
 *   - Увеличение счётчика правильных ответов
 * 
 * - Неправильный ответ:
 *   - Сброс combo до 0
 *   - Сброс мультипликатора до 1.0
 *   - Добавление lexemeId в список ошибок
 *   - Очки не начисляются
 * 
 * @param state - Текущее состояние счёта
 * @param isCorrect - Правильный ли ответ
 * @param lexemeId - ID слова (для трекинга ошибок)
 * @returns Новое состояние счёта
 */
export function applyAnswer(state: ScoreState, isCorrect: boolean, lexemeId: string): ScoreState {
  const next = { ...state, total: state.total + 1 };

  if (isCorrect) {
    // Правильный ответ
    const combo = next.combo + 1;
    const comboMul = Math.min(3, parseFloat((1 + combo * 0.1).toFixed(2)));
    const add = Math.round(100 * comboMul);

    next.score += add;
    next.combo = combo;
    next.comboMul = comboMul;
    next.correct += 1;
  } else {
    // Ошибка
    next.combo = 0;
    next.comboMul = 1;
    next.errors = [...next.errors, lexemeId];
  }

  return next;
}

/**
 * Применяет временной бонус к счёту
 * 
 * Используется при досрочном завершении сессии:
 * бонус = оставшиеся_секунды * perSecond
 * 
 * @param state - Текущее состояние счёта
 * @param bonusPoints - Количество бонусных очков
 * @returns Новое состояние счёта с добавленными очками
 */
export function applyTimeBonus(state: ScoreState, bonusPoints: number): ScoreState {
  return {
    ...state,
    score: state.score + bonusPoints,
  };
}
