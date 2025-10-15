/**
 * Игровой движок - ядро генерации сессий
 * 
 * Ключевые функции:
 * - buildLexemeQueue: создаёт очередь слов с приоритетом низкого мастерства
 * - makeMeaningOptions: генерирует дистракторы (неправильные варианты)
 * - buildSessionPlan: формирует полный план игровой сессии
 * 
 * Алгоритмы:
 * - Взвешенная выборка: слова с низким мастерством (0-3) и ошибками имеют больший вес
 * - 20-30% изученных слов (mastery >= 4) для поддержания памяти
 * - Адаптивные дистракторы: легко/нормально/сложно
 */

import { hashStringToSeed, mulberry32, RNG, shuffleInPlace, weightedSampleIndex } from './random';
import type { DistractorMode, LevelConfig, Pack, QuestionType, SessionPlan, SessionSlot } from './types';

/**
 * Формирует приоритетную очередь слов для сессии
 * 
 * Логика приоритизации:
 * - Вес слова = (5 - mastery) * 2 + min(recent_mistakes, 3) * 3 + 1
 * - Слова с mastery < 4 попадают в основной пул
 * - Слова с mastery >= 4 добавляются на 20-30% слотов
 * - Избегаются последовательные повторения одного слова
 * 
 * @param pack - Словарный пак
 * @param rng - Генератор случайных чисел (детерминированный)
 * @param lanes - Количество вариантов ответа (2 или 3)
 * @param totalSlots - Общее количество вопросов в сессии
 * @returns Массив lexemeId в порядке появления
 */
function buildLexemeQueue(pack: Pack, rng: RNG, lanes: 2 | 3, totalSlots: number): string[] {
  // Разделение на изученные (mastery >= 4) и изучаемые (mastery < 4)
  const learned = pack.lexemes.filter((lx) => (lx.mastery ?? 0) >= 4);
  const learning = pack.lexemes.filter((lx) => (lx.mastery ?? 0) < 4);

  // Целевое количество изученных слов: 20-30% от общего
  const learnedTarget = Math.max(0, Math.min(totalSlots, Math.round(totalSlots * (0.2 + rng() * 0.1))));
  const queue: string[] = [];

  // Вычисление весов для изучаемых слов
  const weightsLearning = learning.map((lx) => {
    const m = lx.mastery ?? 0;
    const recent = lx.recentMistakes?.length ?? 0;
    // Вес увеличивается при низком мастерстве и недавних ошибках
    return (5 - m) * 2 + Math.min(recent, 3) * 3 + 1;
  });

  // Заполнение очереди с учётом весов и целевого количества изученных
  while (queue.length < totalSlots) {
    const needLearned = queue.length < learnedTarget ? rng() < 0.5 : false;

    if (needLearned && learned.length > 0) {
      // Случайный выбор изученного слова
      const idx = Math.floor(rng() * learned.length);
      queue.push(learned[idx].id);
    } else {
      if (learning.length === 0) {
        // Если изучаемых слов нет, берём изученные
        const idx = Math.floor(rng() * (learned.length || 1));
        queue.push((learned[idx] ?? learned[0]).id);
      } else {
        // Взвешенная выборка изучаемого слова
        const idx = weightedSampleIndex(weightsLearning, rng);
        queue.push(learning[idx].id);
      }
    }
  }

  // Устранение последовательных повторений одного слова
  for (let i = 1; i < queue.length; i++) {
    if (queue[i] === queue[i - 1] && pack.lexemes.length > 1) {
      // Поиск другого слова для замены
      for (let j = i + 1; j < queue.length; j++) {
        if (queue[j] !== queue[i]) {
          [queue[i], queue[j]] = [queue[j], queue[i]];
          break;
        }
      }
    }
  }

  return queue;
}

/**
 * Создаёт варианты ответов для вопроса на значение слова
 * 
 * Генерация дистракторов:
 * - easy: сначала берутся дистракторы из других слов, потом собственные
 * - normal: смесь собственных и чужих дистракторов
 * - hard: сначала собственные дистракторы (более похожие), потом чужие
 * 
 * @param pack - Словарный пак
 * @param lexemeId - ID целевого слова
 * @param lanes - Количество вариантов (2 или 3)
 * @param rng - Генератор случайных чисел
 * @param mode - Режим сложности дистракторов
 * @returns Объект с prompt (слово) и options (варианты ответов)
 */
function makeMeaningOptions(
  pack: Pack,
  lexemeId: string,
  lanes: 2 | 3,
  rng: RNG,
  mode: DistractorMode = 'normal'
): { prompt: string; options: { id: string; isCorrect: boolean }[] } {
  const lx = pack.lexemes.find((l) => l.id === lexemeId)!;
  const correct = lx.translations[0] ?? '';

  // Собственные дистракторы слова (из базы данных)
  const own = (lx.distractors?.meaning ?? []).filter((d) => d !== correct);

  // Дистракторы из других слов пака
  const others = pack.lexemes
    .filter((o) => o.id !== lexemeId)
    .map((o) => o.translations[0])
    .filter(Boolean)
    .filter((t) => t !== correct) as string[];

  shuffleInPlace(others, rng);
  shuffleInPlace(own, rng);

  // Формирование пула дистракторов в зависимости от режима
  let pool: string[];
  if (mode === 'hard') {
    // Сложный режим: сначала похожие (собственные), потом чужие
    pool = [...own, ...others];
  } else if (mode === 'easy') {
    // Лёгкий режим: сначала чужие (менее похожие), потом собственные
    pool = [...others, ...own];
  } else {
    // Нормальный режим: смешанный пул
    pool = shuffleInPlace([...own, ...others], rng);
  }

  // Удаление дубликатов
  const seen = new Set<string>();
  const unique = pool.filter((t) => {
    if (seen.has(t)) return false;
    seen.add(t);
    return true;
  });

  // Выбор нужного количества дистракторов
  const chosenDistractors = unique.slice(0, Math.max(0, lanes - 1));

  // Формирование вариантов ответа с правильным
  const raw = [
    { id: correct, isCorrect: true },
    ...chosenDistractors.map((d) => ({ id: d, isCorrect: false })),
  ];

  // Перемешивание вариантов
  const shuffled = shuffleInPlace(raw, rng);

  return {
    prompt: lx.base, // Вопрос - базовая форма слова
    options: shuffled,
  };
}

/**
 * Генерирует полный план игровой сессии
 * 
 * Процесс:
 * 1. Инициализация детерминированного RNG на основе seed
 * 2. Фильтрация слов (если restrictLexemes указан - режим review)
 * 3. Построение очереди слов с приоритетом
 * 4. Генерация слотов с вопросами и дистракторами
 * 5. Расчёт времени появления каждого вопроса
 * 
 * @param params - Параметры сессии
 * @returns Объект SessionPlan с полным планом игры
 */
export function buildSessionPlan(params: {
  pack: Pack;
  level: LevelConfig;
  seed: string;
  restrictLexemes?: string[];
  distractorMode?: DistractorMode;
}): SessionPlan {
  const { pack, level, seed, restrictLexemes, distractorMode = 'normal' } = params;

  // Создание детерминированного RNG из seed
  const rng = mulberry32(
    hashStringToSeed(`${seed}${pack.id}${level.durationSec}${level.forkEverySec}${level.lanes}${distractorMode}`)
  );

  const type: QuestionType = 'meaning';
  let queue: string[];

  // Ограничение слов для режима повторения
  if (restrictLexemes && restrictLexemes.length > 0) {
    const allowed = new Set(pack.lexemes.map((l) => l.id));
    queue = restrictLexemes.filter((id) => allowed.has(id));
  } else {
    // Полная сессия: генерация очереди по алгоритму
    const slotsCount = pack.lexemes.length;
    queue = buildLexemeQueue(pack, rng, level.lanes, slotsCount);
  }

  const slots: SessionSlot[] = [];
  const slotsCountFinal = queue.length;

  // Генерация слотов
  for (let i = 0; i < slotsCountFinal; i++) {
    const lexemeId = queue[i % queue.length];
    const atSec = Math.round((i + 1) * level.forkEverySec); // Время появления вопроса

    const { prompt, options } = makeMeaningOptions(pack, lexemeId, level.lanes, rng, distractorMode);

    slots.push({
      index: i,
      atSec,
      lexemeId,
      type,
      prompt,
      options,
    });
  }

  return {
    seed,
    slots,
    summary: {
      totalSlots: slotsCountFinal,
      lanes: level.lanes,
      forkEverySec: level.forkEverySec,
      durationSec: level.durationSec,
      packId: pack.id,
    },
  };
}
