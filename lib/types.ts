/**
 * Типы данных приложения
 */

export interface Pack {
  id: string;
  title: string;
  lang: string;
  cefr: string;
  category: string;
  levels: PackLevel[];
  lexemes: Lexeme[];
}

export interface PackLevel {
  id: string;
  title: string;
  description: string;
  order: number;
  config: LevelConfig;
  distractorMode: 'easy' | 'normal' | 'hard';
  unlockRequirement: {
    previousLevel?: string;
    minStars: number;
  };
}

export interface Lexeme {
  id: string;
  base: string;
  forms: Record<string, string>;
  translations: string[];
  examples: string[];
  examplesPlural?: string[];
  distractors: {
    meaning?: string[];
    form?: string[];
  };
  mastery: number;
  recentMistakes: string[];
}

export interface LevelConfig {
  durationSec: number;
  forkEverySec: number;
  lanes: 2 | 3;
  allowedTypes: ('meaning' | 'form' | 'anagram' | 'context')[];
  lives: number;
}

export interface SessionSlot {
  index: number;
  atSec: number;
  lexemeId: string;
  type: 'meaning' | 'form' | 'anagram' | 'context';
  prompt: string;
  options: SessionOption[];
  letters?: string[];
  words?: string[];
  correctAnswer?: string;
  context?: string;
}

export interface SessionOption {
  id: string;
  isCorrect: boolean;
}

export interface SessionPlan {
  seed: string;
  slots: SessionSlot[];
}

export interface LexemeProgress {
  mastery: number;
  recentMistakes: string[];
}

export interface LevelProgress {
  levelId: string;
  stars: 0 | 1 | 2 | 3;
  bestScore: number;
  bestAccuracy: number;
  completed: boolean;
  attempts: number;
  lastPlayedAt?: string;
}

export interface ProgressState {
  packs: Record<string, Record<string, LexemeProgress>>;
  levelProgress?: Record<string, Record<string, LevelProgress>>;
  sessions?: RunSummary[];
  adaptive?: Record<string, PackAdaptive>;
}

export interface PackAdaptive {
  weakLexemes: string[];
  lastReviewedAt?: string;
}

export interface Answer {
  lexemeId: string;
  isCorrect: boolean;
  attempts: number;
  usedHint: boolean;
  timeToAnswerMs: number;
}

export interface RunSummary {
  packId: string;
  levelId: string;
  score: number;
  accuracy: number;
  errors: { lexemeId: string }[];
  durationPlayedSec: number;
  seed: string;
  level: LevelConfig;
  answers: Answer[];
  timeBonus: number;
  comboMax: number;
  distractorMode?: 'easy' | 'normal' | 'hard';
}

export interface PackMeta {
  id: string;
  title: string;
  lang: string;
  cefr: string;
  lexemeCount: number;
  category: string;
  levelsCount: number;
}

export interface ScoreState {
  score: number;
  combo: number;
  comboMax: number;
  correct: number;
  total: number;
  errors: string[];
}
