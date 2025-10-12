export type QuestionType = 'meaning' | 'image' | 'form' | 'collocation' | 'phrasal' | 'article' | 'preposition';

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
  mastery: number;            // 0..5
  recentMistakes: string[];   // ISO timestamps
};

export type Pack = {
  id: string;
  title: string;
  lang: string;     // 'EN→RU'
  cefr: 'A0'|'A1'|'A2'|'B1'|'B2';
  lexemes: Lexeme[];
  levelDefaults: LevelConfig;
  category: string;   // Добавлена категория для каждого пака
};

export type PackMeta = {
  id: string;
  title: string;
  lang: string;
  cefr: Pack['cefr'];
  lexemeCount: number;
  category: string; // Добавлена категория для паков
};

export type RunSummary = {
  packId: string;
  score: number;
  accuracy: number; // 0..1
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
    score: number;
    accuracy: number;
    durationSec: number;
    endedAt: string;
    errors: string[];
  }>;
  adaptive?: Record<string, PackAdaptive>;
};

export type LexemeProgress = {
  mastery: number; // 0..5
  recentMistakes: string[];
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

export type SessionOption = {
  id: string;      // строка-значение ответа
  isCorrect: boolean;
};