/**
 * Типы для игровой сессии
 */

import type { LevelConfig, QuestionType } from './pack';

export interface SessionPlan {
  seed: string;
  slots: SessionSlot[];
}

export interface SessionSlot {
  index: number;
  atSec: number;
  lexemeId: string;
  type: QuestionType;
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
  stars: number;
  errors: { lexemeId: string }[];
  durationPlayedSec: number;
  seed: string;
  level: LevelConfig;
  answers: Answer[];
  timeBonus: number;
  comboMax: number;
  distractorMode: 'easy' | 'normal' | 'hard';
  gameMode: 'lives' | 'time';
}

export interface ScoreState {
  score: number;
  combo: number;
  comboMax: number;
  correct: number;
  total: number;
  errors: string[];
}

export interface HighlightState {
  index: number;
  correct: boolean;
}
