/**
 * Утилиты для генератора игры
 */

/**
 * Генератор псевдослучайных чисел
 */
export function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  let state = Math.abs(hash);
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/**
 * Генерирует неправильное написание слова
 */
export function generateMisspelling(word: string, rng: () => number): string {
  if (word.length < 3) return word;
  
  const mutations = [
    // Удалить случайную букву
    () => {
      const pos = Math.floor(rng() * word.length);
      return word.slice(0, pos) + word.slice(pos + 1);
    },
    // Поменять две соседние буквы местами
    () => {
      const pos = Math.floor(rng() * (word.length - 1));
      return word.slice(0, pos) + word[pos + 1] + word[pos] + word.slice(pos + 2);
    },
    // Удвоить случайную букву
    () => {
      const pos = Math.floor(rng() * word.length);
      return word.slice(0, pos) + word[pos] + word.slice(pos);
    },
    // Заменить гласную на похожую
    () => {
      const vowelMap: Record<string, string> = {
        'a': 'e', 'e': 'i', 'i': 'a', 'o': 'u', 'u': 'o'
      };
      let result = word;
      for (let i = 0; i < word.length; i++) {
        const char = word[i].toLowerCase();
        if (vowelMap[char]) {
          result = word.slice(0, i) + vowelMap[char] + word.slice(i + 1);
          break;
        }
      }
      return result;
    }
  ];
  
  const mutation = mutations[Math.floor(rng() * mutations.length)];
  return mutation();
}
