/**
 * Типы для паков и лексем (С РЕЖИМАМИ ИГРЫ)
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
  gameMode: 'lives' | 'time';
}

export interface LexemeData {
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
}

export interface Lexeme extends LexemeData {
  mastery: number;
  recentMistakes: string[];
}

export interface LevelConfig {
  durationSec?: number; // Только для режима "время"
  lanes: 2 | 3;
  allowedTypes: QuestionType[];
  lives?: number; // Только для режима "жизни"
  freezeOnErrorSec?: number; // Только для режима "время"
}

export type QuestionType = 'meaning' | 'form' | 'anagram' | 'context';

export interface PackMeta {
  id: string;
  title: string;
  lang: string;
  cefr: string;
  lexemeCount: number;
  category: string;
  levelsCount: number;
}
