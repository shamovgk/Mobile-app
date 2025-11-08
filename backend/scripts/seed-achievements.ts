import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAchievements() {
  const achievements = [
    {
      key: 'first_level',
      title: 'Первые шаги',
      description: 'Пройдите свой первый уровень',
      icon: '🎯',
      category: 'levels',
      rarity: 'common',
      xpReward: 50,
    },
    {
      key: 'five_levels',
      title: 'Новичок',
      description: 'Пройдите 5 уровней',
      icon: '🌟',
      category: 'levels',
      rarity: 'common',
      xpReward: 100,
    },
    {
      key: 'ten_levels',
      title: 'Опытный',
      description: 'Пройдите 10 уровней',
      icon: '🏆',
      category: 'levels',
      rarity: 'rare',
      xpReward: 250,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }

  console.log('✅ Достижения добавлены');
}

seedAchievements()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
