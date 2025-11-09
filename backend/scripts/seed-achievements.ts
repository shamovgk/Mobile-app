import { PrismaClient } from '@prisma/client';

export async function seedAchievements(prisma: PrismaClient) {
  console.log('🏆 Добавление достижений...');

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
    {
      key: 'perfect_level',
      title: 'Перфекционист',
      description: 'Завершите уровень без ошибок',
      icon: '💯',
      category: 'performance',
      rarity: 'rare',
      xpReward: 150,
    },
    {
      key: 'speed_demon',
      title: 'Молниеносный',
      description: 'Завершите уровень за 30 секунд',
      icon: '⚡',
      category: 'performance',
      rarity: 'epic',
      xpReward: 200,
    },
    {
      key: 'first_pack',
      title: 'Открыватель',
      description: 'Завершите первый пак',
      icon: '📦',
      category: 'packs',
      rarity: 'common',
      xpReward: 300,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
    console.log(`   ├─ ${achievement.icon} ${achievement.title}`);
  }

  console.log(`   └─ Добавлено ${achievements.length} достижений`);
}

// Если файл запускается напрямую
if (require.main === module) {
  const prisma = new PrismaClient();
  seedAchievements(prisma)
    .catch((e) => {
      console.error('❌ Ошибка seed достижений:');
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
