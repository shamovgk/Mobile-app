/**
 * Константы приложения
 */

// Игровые константы
export const BONUS_PER_SEC = 50;
export const MAX_RECENT_MISTAKES = 10;
export const MISTAKES_RETENTION_DAYS = 7;

// Прогресс
export const MASTERY_MAX = 5;
export const MASTERY_MULTIPLIERS = {
  easy: 0.5,
  normal: 1.0,
  hard: 1.5,
} as const;

export const MASTERY_DECREASE_ON_ERROR = 0.5;

// Звёзды
export const STARS_THRESHOLDS = {
  THREE: 0.95,
  TWO: 0.85,
  ONE: 0.70,
} as const;

// Хранилище
export const STORAGE_KEYS = {
  PROGRESS: 'progress:v1',
  SOUND: 'settings:sound',
  HAPTICS: 'settings:haptics',
} as const;

export const MAX_SESSIONS_HISTORY = 100;

// Цвета мастерства
export const MASTERY_COLORS = {
  NONE: '#f44336',
  BEGINNER: '#ff9800',
  LEARNING: '#ffc107',
  KNOWS: '#8bc34a',
  CONFIDENT: '#4caf50',
  MASTER: '#2196f3',
} as const;

// Лейблы мастерства
export const MASTERY_LABELS = {
  0: 'Не изучено',
  1: 'Начинающий',
  2: 'Изучаю',
  3: 'Знаю',
  4: 'Уверенно',
  5: 'Мастер',
} as const;

// Время заморозки при ошибке (в секундах)
export const FREEZE_TIME = {
  easy: 1,    // 1 секунда
  normal: 2,  // 2 секунды
  hard: 3,    // 3 секунды
} as const;

// Звёзды для режима "на жизни" (по оставшимся жизням)
export const STARS_BY_LIVES = {
  3: 3,  // Все жизни → 3 звезды
  2: 2,  // 2 жизни → 2 звезды
  1: 1,  // 1 жизнь → 1 звезда
  0: 0,  // 0 жизней → 0 звёзд
} as const;
