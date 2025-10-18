/**
 * Типы для прогресса пользователя
 */

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
  sessions?: any[];
  adaptive?: Record<string, PackAdaptive>;
}

export interface PackAdaptive {
  weakLexemes: string[];
  lastReviewedAt?: string;
}
