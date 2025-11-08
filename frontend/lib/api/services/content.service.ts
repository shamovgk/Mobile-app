import { apiClient } from '../client';

// Типы данных (соответствуют ответам API)
export interface Pack {
  id: string;
  slug: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  icon: string | null;
  order: number;
  levelsCount: number;
}

export interface Level {
  id: string;
  levelNumber: number;
  mode: string;
  difficulty: string;
  lexemesCount: number;
}

export interface PackDetails extends Pack {
  levels: Level[];
}

export interface Lexeme {
  id: string;
  form: string;
  meaning: string;
  contexts: string[];
  difficulty: number;
  audio: string | null;
  image: string | null;
}

export interface LevelDetails extends Level {
  pack: {
    id: string;
    title: string;
    slug: string;
  };
  lexemes: Lexeme[];
}

// API методы
export const contentApi = {
  // Получить все паки
  getPacks: async (): Promise<Pack[]> => {
    const { data } = await apiClient.get<Pack[]>('/content/packs');
    return data;
  },

  // Получить детали пака
  getPack: async (packId: string): Promise<PackDetails> => {
    const { data } = await apiClient.get<PackDetails>(`/content/packs/${packId}`);
    return data;
  },

  // Получить уровень с лексемами
  getLevel: async (levelId: string): Promise<LevelDetails> => {
    const { data } = await apiClient.get<LevelDetails>(`/content/levels/${levelId}`);
    return data;
  },
};
