import { apiClient } from '../client';

export interface DictionaryWord {
  id: string;
  form: string;
  meaning: string;
  contexts: string[];
  difficulty: number;
  mastery: number;
  totalAttempts: number;
  correctAttempts: number;
  wrongAttempts: number;
  accuracy: number;
  lastSeenAt: string;
  packs: string[];
}

export interface DictionaryStats {
  totalWords: number;
  mastered: number;
  learning: number;
  notStarted: number;
}

export interface DictionaryResponse {
  dictionary: DictionaryWord[];
  stats: DictionaryStats;
}

export const dictionaryApi = {
  getDictionary: async (): Promise<DictionaryResponse> => {
    const { data } = await apiClient.get('/progress/dictionary');
    return data;
  },
};
