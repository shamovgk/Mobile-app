/**
 * Утилиты для детерминированной генерации случайных чисел
 * 
 * Использует алгоритм Mulberry32 для воспроизводимых результатов
 * на основе seed - критично для одинаковых сессий при одном seed
 */

/**
 * Преобразует строку в числовой seed
 * 
 * Использует простую хеш-функцию для конвертации
 * строки в 32-битное целое число
 * 
 * @param str - Входная строка (например, "pack-food-1-2025-10-12")
 * @returns Числовой seed для RNG
 */
export function hashStringToSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/**
 * Создаёт детерминированный генератор случайных чисел
 * 
 * Алгоритм Mulberry32:
 * - Быстрый и простой PRNG
 * - Гарантирует одинаковую последовательность при одном seed
 * - Период ~4 миллиарда чисел
 * 
 * @param seed - Начальное значение (любое число)
 * @returns Функция-генератор, возвращающая числа от 0 до 1
 */
export function mulberry32(seed: number) {
  let t = seed + 0x6D2B79F5;
  return function rand() {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Тип для функции-генератора случайных чисел
 * Возвращает число от 0 (включительно) до 1 (не включительно)
 */
export type RNG = () => number;

/**
 * Выбирает случайный элемент из массива
 * 
 * @param arr - Массив элементов
 * @param rng - Генератор случайных чисел
 * @returns Случайный элемент из массива
 */
export function pickOne<T>(arr: T[], rng: RNG): T {
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Перемешивает массив "на месте" (in-place)
 * 
 * Использует алгоритм Fisher-Yates (Knuth shuffle)
 * для равномерного перемешивания
 * 
 * @param arr - Массив для перемешивания
 * @param rng - Генератор случайных чисел
 * @returns Тот же массив (изменённый)
 */
export function shuffleInPlace<T>(arr: T[], rng: RNG): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Взвешенная выборка индекса из массива весов
 * 
 * Выбирает индекс с вероятностью, пропорциональной весу
 * Используется для приоритетного выбора слов с низким мастерством
 * 
 * Пример:
 * weights = [1, 3, 6] → вероятности: 10%, 30%, 60%
 * 
 * @param weights - Массив весов (чем больше вес, тем выше шанс)
 * @param rng - Генератор случайных чисел
 * @returns Индекс выбранного элемента
 */
export function weightedSampleIndex(weights: number[], rng: RNG): number {
  // Сумма всех весов
  const sum = weights.reduce((a, b) => a + (b > 0 ? b : 0), 0);
  
  // Если все веса нулевые, выбираем случайно
  if (sum <= 0) return Math.floor(rng() * weights.length);

  // Случайное число от 0 до суммы весов
  let r = rng() * sum;

  // Поиск индекса, соответствующего выпавшему числу
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i] > 0 ? weights[i] : 0;
    if (r < w) return i;
    r -= w;
  }

  return weights.length - 1;
}
