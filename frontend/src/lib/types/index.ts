// frontend/lib/types/index.ts

// ============================================
// API TYPES (от backend)
// ============================================

export interface GeneratedQuestion {
  type: 'meaning' | 'form' | 'context' | 'anagram';
  lexemeId: string;
  prompt: string;
  correctAnswer: string;
  options?: string[];
  context?: string;
}

export interface LevelData {
  id: string;
  packId?: string;
  levelNumber: number;
  mode: string;
  difficulty: string;
  timeLimit: number | null;
  lives: number | null;
  targetScore: number;
  seed: number;
  questions: GeneratedQuestion[];
  lexemes: Array<{
    id: string;
    form: string;
    meaning: string;
    contexts: string[];
    difficulty: number;
  }>;
}

// ============================================
// UI TYPES (для компонентов)
// ============================================

export interface QuestionOption {
  id: string;
  isCorrect: boolean;
}

export interface SessionSlot {
  id: string;
  lexemeId: string;
  type: 'meaning' | 'form' | 'context' | 'anagram';
  prompt: string;
  context?: string;
  options: QuestionOption[];
  letters?: string[];
}
