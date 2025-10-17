/**
 * Движок генерации игровых сессий
 */

import type { LevelConfig, Lexeme, Pack, SessionOption, SessionPlan, SessionSlot } from './types';

/**
 * Простой генератор псевдослучайных чисел (seeded RNG)
 */
function seededRandom(seed: string): () => number {
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
function generateMisspelling(word: string, rng: () => number): string {
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

/**
 * Генерирует слот типа "meaning" (перевод слова)
 */
function buildMeaningSlot(
  lex: Lexeme,
  index: number,
  atSec: number,
  lanes: 2 | 3,
  allLexemes: Lexeme[],
  distractorMode: 'easy' | 'normal' | 'hard',
  rng: () => number
): SessionSlot {
  const correctTranslation = lex.translations[0] ?? lex.base;

  let distractors: string[] = [];
  if (distractorMode === 'easy' && lex.distractors?.meaning) {
    distractors = lex.distractors.meaning.slice(0, lanes - 1);
  }

  if (distractors.length < lanes - 1) {
    const pool = allLexemes
      .filter((l) => l.id !== lex.id)
      .map((l) => l.translations[0] ?? l.base);
    
    const needed = lanes - 1 - distractors.length;
    const shuffled = pool.sort(() => rng() - 0.5);
    distractors = [...distractors, ...shuffled.slice(0, needed)];
  }

  const options: SessionOption[] = [
    { id: correctTranslation, isCorrect: true },
    ...distractors.map((d) => ({ id: d, isCorrect: false })),
  ];

  options.sort(() => rng() - 0.5);

  return {
    index,
    atSec,
    lexemeId: lex.id,
    type: 'meaning',
    prompt: lex.base,
    options,
  };
}

/**
 * Генерирует слот типа "form" (правильное написание слова)
 */
function buildFormSlot(
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

  const options: SessionOption[] = [
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

/**
 * Генерирует слот типа "anagram" (сборка слова из букв)
 */
function buildAnagramSlot(
  lex: Lexeme,
  index: number,
  atSec: number,
  lanes: 2 | 3,
  allLexemes: Lexeme[],
  rng: () => number
): SessionSlot {
  const correctWord = lex.base;
  const translation = lex.translations[0] ?? lex.base;
  
  // Разбиваем слово на массив букв
  const wordLetters = correctWord.split('');
  
  // Добавляем 3-5 лишних букв для усложнения
  const extraLettersCount = Math.floor(rng() * 3) + 3; // 3-5 лишних букв
  const allPossibleLetters = 'abcdefghijklmnopqrstuvwxyz';
  const extraLetters: string[] = [];
  
  for (let i = 0; i < extraLettersCount; i++) {
    const randomLetter = allPossibleLetters[Math.floor(rng() * allPossibleLetters.length)];
    extraLetters.push(randomLetter);
  }
  
  // Объединяем буквы слова с лишними буквами
  const allLetters = [...wordLetters, ...extraLetters];
  
  // Перемешиваем все буквы
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

/**
 * Генерирует слот типа "context" (выбор правильной формы слова)
 */
function buildContextSlot(
  lex: Lexeme,
  index: number,
  atSec: number,
  lanes: 2 | 3,
  allLexemes: Lexeme[],
  rng: () => number
): SessionSlot | null {
  const singularForm = lex.base;
  const pluralForm = lex.forms?.plural || lex.base + 's';
  
  // Пропускаем слова где singular === plural
  if (singularForm.toLowerCase() === pluralForm.toLowerCase()) {
    return null;
  }

  // Выбираем случайно singular или plural вариант
  const usePlural = rng() > 0.5;
  
  let example: string;
  if (usePlural) {
    // Берём пример с множественным числом
    example = lex.examplesPlural?.[0] || `I like ${pluralForm}.`;
  } else {
    // Берём пример с единственным числом
    example = lex.examples?.[0] || `I like ${singularForm}.`;
  }

  const correctForm = usePlural ? pluralForm : singularForm;
  
  // Заменяем слово на пропуск
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

/**
 * Генерирует один слот
 */
function buildSlot(
  lex: Lexeme,
  index: number,
  atSec: number,
  lanes: 2 | 3,
  types: LevelConfig['allowedTypes'],
  allLexemes: Lexeme[],
  distractorMode: 'easy' | 'normal' | 'hard',
  rng: () => number
): SessionSlot | null {
  const type = types[Math.floor(rng() * types.length)];

  switch (type) {
    case 'anagram':
      return buildAnagramSlot(lex, index, atSec, lanes, allLexemes, rng);
    
    case 'context':
      return buildContextSlot(lex, index, atSec, lanes, allLexemes, rng);
    
    case 'form':
      return buildFormSlot(lex, index, atSec, lanes, allLexemes, distractorMode, rng);
    
    case 'meaning':
    default:
      return buildMeaningSlot(lex, index, atSec, lanes, allLexemes, distractorMode, rng);
  }
}

/**
 * Строит план игровой сессии
 */
export function buildSessionPlan(params: {
  pack: Pack;
  level: LevelConfig;
  seed: string;
  restrictLexemes?: string[];
  distractorMode?: 'easy' | 'normal' | 'hard';
}): SessionPlan {
  const { pack, level, seed, restrictLexemes, distractorMode = 'normal' } = params;
  const rng = seededRandom(seed);

  let lexPool = [...pack.lexemes];
  if (restrictLexemes && restrictLexemes.length > 0) {
    lexPool = lexPool.filter((l) => restrictLexemes.includes(l.id));
  }

  if (lexPool.length === 0) {
    lexPool = [...pack.lexemes];
  }

  const slots: SessionSlot[] = [];
  let index = 0;

  for (let sec = 0; sec < level.durationSec; sec += level.forkEverySec) {
    let slot: SessionSlot | null = null;
    let attempts = 0;
    
    // Пытаемся создать слот, пропуская неподходящие слова
    while (slot === null && attempts < 10) {
      const lex = lexPool[Math.floor(rng() * lexPool.length)];
      slot = buildSlot(lex, index, sec, level.lanes, level.allowedTypes, pack.lexemes, distractorMode, rng);
      attempts++;
    }
    
    if (slot) {
      slots.push(slot);
      index++;
    }
  }

  return { seed, slots };
}
