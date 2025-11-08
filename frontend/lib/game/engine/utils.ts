
/**
 * Seeded random number generator (PRNG)
 */
export function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }

  return function() {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

/**
 * Генерирует опечатку в слове
 */
export function generateMisspelling(word: string, rng: () => number): string {
  if (word.length < 3) return word + 's';

  const strategies = [
    // Удалить букву
    () => {
      const idx = Math.floor(rng() * word.length);
      return word.slice(0, idx) + word.slice(idx + 1);
    },
    // Дублировать букву
    () => {
      const idx = Math.floor(rng() * word.length);
      return word.slice(0, idx) + word[idx] + word.slice(idx);
    },
    // Поменять соседние буквы
    () => {
      if (word.length < 2) return word;
      const idx = Math.floor(rng() * (word.length - 1));
      const chars = word.split('');
      [chars[idx], chars[idx + 1]] = [chars[idx + 1], chars[idx]];
      return chars.join('');
    },
    // Заменить букву на похожую
    () => {
      const similar: Record<string, string[]> = {
        'a': ['e', 'o'],
        'e': ['a', 'i'],
        'i': ['e', 'y'],
        'o': ['a', 'u'],
        'u': ['o', 'i'],
      };
      
      const idx = Math.floor(rng() * word.length);
      const letter = word[idx].toLowerCase();
      const replacements = similar[letter];
      
      if (replacements) {
        const newLetter = replacements[Math.floor(rng() * replacements.length)];
        return word.slice(0, idx) + newLetter + word.slice(idx + 1);
      }
      
      return word + 's';
    },
  ];

  const strategy = strategies[Math.floor(rng() * strategies.length)];
  const result = strategy();
  
  return result === word ? word + 's' : result;
}

/**
 * Перемешивает массив (Fisher-Yates shuffle)
 */
export function shuffle<T>(array: T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
