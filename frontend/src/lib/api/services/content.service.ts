import apiClient from '../client';

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

export const contentApi = {
  getPacks: async () => {
    const response = await apiClient.get('/content/packs');
    return response.data;
  },

  getPack: async (packId: string) => {
    const response = await apiClient.get(`/content/packs/${packId}`);
    return response.data;
  },

  generateLevel: async (levelId: string): Promise<LevelData> => {
    const response = await apiClient.get(`/content/levels/${levelId}/generate`);
    return response.data;
  },
};
