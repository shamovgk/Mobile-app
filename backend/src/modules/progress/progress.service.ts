import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubmitResultDto } from './dto/submit-result.dto';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  // Отправить результат прохождения уровня
  async submitResult(userId: string, dto: SubmitResultDto) {
    // Сохраняем попытку
    const attempt = await this.prisma.levelAttempt.create({
      data: {
        userId,
        levelId: dto.levelId,
        score: dto.score,
        stars: dto.stars,
        correctAnswers: dto.correctAnswers,
        wrongAnswers: dto.wrongAnswers,
        duration: dto.duration,
      },
    });

    // Получаем информацию об уровне (нужен packId)
    const level = await this.prisma.level.findUnique({
      where: { id: dto.levelId },
      select: { packId: true },
    });

    if (!level) {
      throw new Error('Level not found');
    }

    // Обновляем прогресс пользователя по уровню
    const existingProgress = await this.prisma.userLevelProgress.findUnique({
      where: {
        userId_levelId: {
          userId,
          levelId: dto.levelId,
        },
      },
    });

    if (existingProgress) {
      await this.prisma.userLevelProgress.update({
        where: { id: existingProgress.id },
        data: {
          bestScore: Math.max(existingProgress.bestScore, dto.score),
          highestStars: Math.max(existingProgress.highestStars, dto.stars),
          timesPlayed: existingProgress.timesPlayed + 1,
          completedAt: dto.stars > 0 ? new Date() : existingProgress.completedAt,
        },
      });
    } else {
      await this.prisma.userLevelProgress.create({
        data: {
          userId,
          levelId: dto.levelId,
          packId: level.packId,
          bestScore: dto.score,
          highestStars: dto.stars,
          timesPlayed: 1,
          completedAt: dto.stars > 0 ? new Date() : null,
        },
      });
    }

    // Обновляем профиль пользователя
    await this.updateUserProfile(userId, dto);

    // Проверяем достижения
    await this.checkAchievements(userId);

    return {
      success: true,
      attempt,
      message: 'Результат сохранён',
    };
  }

  // Обновление профиля пользователя (XP, уровень)
  private async updateUserProfile(userId: string, dto: SubmitResultDto) {
    const xpGained = this.calculateXP(dto);

    await this.prisma.profile.update({
      where: { userId },
      data: {
        totalXp: { increment: xpGained },
        lastPlayedAt: new Date(),
      },
    });
  }

  // Расчёт XP
  private calculateXP(dto: SubmitResultDto): number {
    let xp = dto.correctAnswers * 10;
    xp += dto.stars * 50;
    return xp;
  }

  // Получить прогресс пользователя
  async getUserProgress(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    const levelProgress = await this.prisma.userLevelProgress.findMany({
      where: { userId },
      include: {
        level: {
          include: {
            pack: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    const achievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });

    return {
      profile,
      levelProgress,
      achievements,
    };
  }

  // Получить историю попыток
  async getLevelAttempts(userId: string, levelId: string) {
    return this.prisma.levelAttempt.findMany({
      where: { userId, levelId },
      orderBy: { completedAt: 'desc' },
      take: 10,
    });
  }

  // Проверка достижений
  private async checkAchievements(userId: string) {
    const completedLevels = await this.prisma.userLevelProgress.count({
      where: {
        userId,
        highestStars: { gte: 1 },
      },
    });

    if (completedLevels >= 1) {
      await this.unlockAchievement(userId, 'first_level');
    }

    if (completedLevels >= 5) {
      await this.unlockAchievement(userId, 'five_levels');
    }

    if (completedLevels >= 10) {
      await this.unlockAchievement(userId, 'ten_levels');
    }
  }

  // Разблокировать достижение
  private async unlockAchievement(userId: string, key: string) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { key },
    });

    if (!achievement) return;

    const existing = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (!existing) {
      await this.prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });
    }
  }

  async getUserDictionary(userId: string) {
  // Получить все попытки пользователя
  const attempts = await this.prisma.levelAttempt.findMany({
    where: { userId },
    include: {
      level: {
        include: {
          lexemes: {
            include: {
              lexeme: true,
            },
          },
          pack: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: { completedAt: 'desc' },
  });

  // Сгруппировать по словам
  const lexemeMap = new Map<string, {
    lexeme: any;
    totalAttempts: number;
    correctAttempts: number;
    wrongAttempts: number;
    lastSeenAt: Date;
    packTitles: Set<string>;
  }>();

  for (const attempt of attempts) {
    for (const levelLexeme of attempt.level.lexemes) {
      const lexeme = levelLexeme.lexeme;
      const key = lexeme.id;

      if (!lexemeMap.has(key)) {
        lexemeMap.set(key, {
          lexeme,
          totalAttempts: 0,
          correctAttempts: 0,
          wrongAttempts: 0,
          lastSeenAt: attempt.completedAt,
          packTitles: new Set([attempt.level.pack.title]),
        });
      }

      const entry = lexemeMap.get(key)!;
      entry.totalAttempts += 1;

      // Предполагаем, что правильность зависит от звёзд
      if (attempt.stars >= 2) {
        entry.correctAttempts += 1;
      } else {
        entry.wrongAttempts += 1;
      }

      if (attempt.completedAt > entry.lastSeenAt) {
        entry.lastSeenAt = attempt.completedAt;
      }

      entry.packTitles.add(attempt.level.pack.title);
    }
  }

  // Рассчитать мастерство (mastery)
  const dictionary = Array.from(lexemeMap.entries()).map(([id, data]) => {
    const accuracy = data.totalAttempts > 0 
      ? data.correctAttempts / data.totalAttempts 
      : 0;

    // Mastery formula: 0-5 на основе точности и кол-ва повторений
    let mastery = 0;
    if (data.totalAttempts >= 1 && accuracy >= 0.8) mastery = 1;
    if (data.totalAttempts >= 2 && accuracy >= 0.85) mastery = 2;
    if (data.totalAttempts >= 3 && accuracy >= 0.9) mastery = 3;
    if (data.totalAttempts >= 5 && accuracy >= 0.95) mastery = 4;
    if (data.totalAttempts >= 8 && accuracy >= 0.98) mastery = 5;

    return {
      id: data.lexeme.id,
      form: data.lexeme.form,
      meaning: data.lexeme.meaning,
      contexts: data.lexeme.contexts,
      difficulty: data.lexeme.difficulty,
      mastery,
      totalAttempts: data.totalAttempts,
      correctAttempts: data.correctAttempts,
      wrongAttempts: data.wrongAttempts,
      accuracy: Math.round(accuracy * 100),
      lastSeenAt: data.lastSeenAt,
      packs: Array.from(data.packTitles),
    };
  });

  // Статистика
  const stats = {
    totalWords: dictionary.length,
    mastered: dictionary.filter(w => w.mastery >= 5).length,
    learning: dictionary.filter(w => w.mastery >= 1 && w.mastery < 5).length,
    notStarted: dictionary.filter(w => w.mastery === 0).length,
  };

  return {
    dictionary: dictionary.sort((a, b) => 
      b.lastSeenAt.getTime() - a.lastSeenAt.getTime()
    ),
    stats,
  };
}
}
