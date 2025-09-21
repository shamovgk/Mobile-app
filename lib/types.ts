export type QuestionType = 'meaning' | 'image' | 'form' | 'collocation' | 'phrasal' | 'article' | 'preposition';

export type LevelConfig = {
  durationSec: number;
  forkEverySec: number;
  lanes: 2 | 3;
  allowedTypes: QuestionType[];
  lives: number;
};

export type Distractors = {
  meaning?: string[];
  image?: string[];        // имена ассетов или id
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
  // прогресс по умолчанию из JSON; актуальный прогресс берём из Storage
  mastery: number;            // 0..5
  recentMistakes: string[];   // ISO timestamps (короткая история)
};

export type Pack = {
  id: string;
  title: string;
  lang: string;     // 'EN→RU'
  cefr: 'A0'|'A1'|'A2'|'B1'|'B2';
  lexemes: Lexeme[];
  levelDefaults: LevelConfig;
};

export type PackMeta = {
  id: string;
  title: string;
  lang: string;
  cefr: Pack['cefr'];
  lexemeCount: number;
};

export type RunSummary = {
  packId: string;
  score: number;
  accuracy: number; // 0..1
  errors: Array<{ lexemeId: string; sample?: string }>;
  durationPlayedSec: number;
  seed: string;
  level: LevelConfig;
};

// Хранилище прогресса
export type LexemeProgress = {
  mastery: number; // 0..5
  // можем хранить последние N ошибок как счетчик/временные метки
  recentMistakes: string[]; // ISO strings
};

export type ProgressState = {
  // по packId → lexemeId → progress
  packs: Record<string, Record<string, LexemeProgress>>;
  // история сессий (лёгкая сводка)
  sessions: Array<{
    id: string;          // `${packId}:${timestamp}`
    packId: string;
    score: number;
    accuracy: number;
    durationSec: number;
    endedAt: string;     // ISO
    errors: string[];    // lexemeIds
  }>;
};

export type SessionOption = {
  id: string;      // строка-значение ответа
  isCorrect: boolean;
};

export type SessionSlot = {
  index: number;       // 0..slots-1
  atSec: number;       // время появления
  lexemeId: string;
  type: QuestionType;  // MVP: 'meaning'
  prompt: string;      // что показываем (EN слово)
  options: SessionOption[]; // ответы (RU)
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
