import { apiClient } from '../client';

export interface SubmitResultDto {
  levelId: string;
  score: number;
  stars: number;
  correctAnswers: number;
  wrongAnswers: number;
  duration: number;
}

export interface LevelAttempt {
  id: string;
  userId: string;
  levelId: string;
  score: number;
  stars: number;
  correctAnswers: number;
  wrongAnswers: number;
  duration: number;
  completedAt: string;
}

export interface UserProgress {
  profile: {
    id: string;
    userId: string;
    totalXp: number;
    level: number;
    streak: number;
  };
  levelProgress: Array<{
    id: string;
    bestScore: number;
    highestStars: number;
    timesPlayed: number;
  }>;
  achievements: Array<{
    id: string;
    achievement: {
      id: string;
      key: string;
      title: string;
      icon: string;
    };
  }>;
}

export const progressApi = {
  // Отправить результат игры
  submitResult: async (dto: SubmitResultDto): Promise<{ success: boolean }> => {
    const { data } = await apiClient.post('/progress/submit', dto);
    return data;
  },

  // Получить прогресс пользователя
  getProgress: async (): Promise<UserProgress> => {
    const { data } = await apiClient.get('/progress/me');
    return data;
  },

  // Получить попытки по уровню
  getLevelAttempts: async (levelId: string): Promise<LevelAttempt[]> => {
    const { data } = await apiClient.get(`/progress/level/${levelId}`);
    return data;
  },
};
