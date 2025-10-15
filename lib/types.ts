/**
 * Определения типов для всего приложения с системой уровней
 */

export type QuestionType = 'meaning' | 'image' | 'form' | 'collocation' | 'phrasal' | 'article' | 'preposition';

/**
 * Конфигурация уровня сложности
 */
export type LevelConfig = {
  durationSec: number;
  forkEverySec: number;
  lanes: 2 | 3;
  allowedTypes: QuestionType[];
  lives: number;
};

export type DistractorMode = 'easy' | 'normal' | 'hard';

export type Distractors = {
  meaning?: string[];
  image?: string[];
  form?: string[];
  collocation?: string[];
  phrasal?: string[];
  article?: string[];
  preposition?: string[];
};

export type Lexeme = {
  id: string;
  base: string;
  forms: Record<string, string>;
  translations: string[];
  examples: string[];
  distractors: Distractors;
  mastery: number;
  recentMistakes: string[];
};

/**
 * Уровень внутри пака
 */
export type PackLevel = {
  id: string;
  title: string;
  description: string;
  order: number;
  config: LevelConfig;
  restrictLexemes?: string[];
  distractorMode: DistractorMode;
  unlockRequirement: {
    previousLevel?: string;
    minStars: 1 | 2 | 3;
  };
};

/**
 * Словарный пак с уровнями
 */
export type Pack = {
  id: string;
  title: string;
  lang: string;
  cefr: 'A0' | 'A1' | 'A2' | 'B1' | 'B2';
  lexemes: Lexeme[];
  levels: PackLevel[];
  category: string;
};

export type PackMeta = {
  id: string;
  title: string;
  lang: string;
  cefr: Pack['cefr'];
  lexemeCount: number;
  category: string;
  levelsCount: number;
};

/**
 * Прогресс по уровню
 */
export type LevelProgress = {
  levelId: string;
  stars: 0 | 1 | 2 | 3;
  bestScore: number;
  bestAccuracy: number;
  completed: boolean;
  attempts: number;
  lastPlayedAt?: string;
};

export type RunSummary = {
  packId: string;
  levelId: string;
  score: number;
  accuracy: number;
  errors: Array<{ lexemeId: string; sample?: string }>;
  durationPlayedSec: number;
  seed: string;
  level: LevelConfig;
  answers?: Array<{
    lexemeId: string;
    isCorrect: boolean;
    attempts: number;
    usedHint: boolean;
    timeToAnswerMs: number;
  }>;
  timeBonus?: number;
  comboMax?: number;
};

export type PackAdaptive = {
  lastSessionAccuracy: number;
  lastAnswersWindow: number[];
  windowSize: number;
};

export type ProgressState = {
  packs: Record<string, Record<string, LexemeProgress>>;
  sessions: Array<{
    id: string;
    packId: string;
    levelId: string;
    score: number;
    accuracy: number;
    durationSec: number;
    endedAt: string;
    errors: string[];
  }>;
  adaptive?: Record<string, PackAdaptive>;
  levelProgress?: Record<string, Record<string, LevelProgress>>;
};

export type LexemeProgress = {
  mastery: number;
  recentMistakes: string[];
};

export type SessionOption = {
  id: string;
  isCorrect: boolean;
};

export type SessionSlot = {
  index: number;
  atSec: number;
  lexemeId: string;
  type: QuestionType;
  prompt: string;
  options: SessionOption[];
};

export type SessionPlan = {
  seed: string;
  slots: SessionSlot[];
  summary: {
    totalSlots: number;
    lanes: 2 | 3;
    forkEverySec: number;
    durationSec: number;
    packId: string;
  };
};
