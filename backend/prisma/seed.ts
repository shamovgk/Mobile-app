import { PrismaClient } from '@prisma/client';
import { seedContent } from '../scripts/seed-content';
import { seedAchievements } from '../scripts/seed-achievements';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...\n');

  try {
    // 1. Сначала загружаем контент (паки, уровни, лексемы)
    console.log('📦 Загрузка контента...');
    await seedContent(prisma);
    console.log('✅ Контент загружен\n');

    // 2. Затем загружаем достижения
    console.log('🏆 Загрузка достижений...');
    await seedAchievements(prisma);
    console.log('✅ Достижения загружены\n');

    console.log('🎉 База данных успешно заполнена!');
  } catch (e) {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    throw e;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
