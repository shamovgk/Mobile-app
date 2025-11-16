import { PrismaClient, Lexeme } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface LexemeData {
  form: string;
  meaning: string;
  contexts: string[];
  difficulty?: number;
}

interface LevelConfig {
  levelNumber: number;
  mode: string;
  difficulty: string;
  allowedTypes: string[];
  lexemeCount: number;
  difficultyRange: [number, number];
  timeLimit?: number;
}

interface PackData {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  order?: number;
  icon?: string;
  lexemes: LexemeData[];
  levels: LevelConfig[];
}

export async function seedContent(prisma: PrismaClient) {
  console.log('🌱 Начинаем сидирование контента...');

  await prisma.levelLexeme.deleteMany();
  await prisma.lexeme.deleteMany();
  await prisma.level.deleteMany();
  await prisma.pack.deleteMany();

  const packsDir = path.join(__dirname, '../../frontend/data/packs');
  if (!fs.existsSync(packsDir)) {
    throw new Error(`Директория с паками не найдена: ${packsDir}`);
  }

  const packFiles = fs
    .readdirSync(packsDir)
    .filter(file => file.endsWith('.json'));

  console.log(`Найдено ${packFiles.length} файлов паков`);

  for (const file of packFiles) {
    const filePath = path.join(packsDir, file);
    console.log(`\n📦 Обрабатываем: ${file}`);

    const packData: PackData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const pack = await prisma.pack.create({
      data: {
        slug: packData.id,
        title: packData.title,
        description: packData.description,
        language: packData.language ?? 'en',
        difficulty: packData.difficulty,
        icon: packData.icon ?? null,
        order: packData.order ?? 0,
      },
    });

    console.log(`  ✓ Создан пак: ${pack.title} (ID: ${pack.id})`);
    console.log(`  📝 Создаём ${packData.lexemes.length} лексем...`);

    const lexemesData = packData.lexemes.map(lexemeData => ({
      packId: pack.id,
      form: lexemeData.form,
      meaning: lexemeData.meaning,
      contexts: lexemeData.contexts,
      difficulty: lexemeData.difficulty ?? 1,
    }));

    await prisma.lexeme.createMany({ data: lexemesData });

    const createdLexemes = await prisma.lexeme.findMany({
      where: { packId: pack.id },
    });

    console.log(`  ✓ Создано ${createdLexemes.length} лексем`);
    console.log(`  🎮 Генерируем ${packData.levels.length} уровней...`);

    for (const levelConfig of packData.levels) {
      const [minDiff, maxDiff] = levelConfig.difficultyRange;
      const suitableLexemes = createdLexemes.filter(
        l => l.difficulty >= minDiff && l.difficulty <= maxDiff,
      );

      const shuffled = [...suitableLexemes].sort(() => Math.random() - 0.5);
      const selectedLexemes = shuffled.slice(0, levelConfig.lexemeCount);

      if (selectedLexemes.length < levelConfig.lexemeCount) {
        console.warn(
          `    ⚠️  Уровень ${levelConfig.levelNumber}: запрошено ${levelConfig.lexemeCount}, доступно ${selectedLexemes.length}`,
        );
      }

      const level = await prisma.level.create({
        data: {
          packId: pack.id,
          levelNumber: levelConfig.levelNumber,
          mode: levelConfig.mode,
          difficulty: levelConfig.difficulty,
          timeLimit: levelConfig.timeLimit ?? null,
          lives: levelConfig.mode === 'lives' ? 3 : null,
          targetScore: levelConfig.lexemeCount * 10,
        },
      });

      await prisma.levelLexeme.createMany({
        data: selectedLexemes.map(lexeme => ({
          levelId: level.id,
          lexemeId: lexeme.id,
        })),
      });

      console.log(
        `    ✓ Уровень ${level.levelNumber} (${levelConfig.mode}): ${selectedLexemes.length} слов`,
      );
    }

    console.log(`  ✅ Пак "${pack.title}" завершён: ${packData.levels.length} уровней`);
  }

  console.log('\n✅ Сидирование контента завершено!');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedContent(prisma)
    .catch(e => {
      console.error('Ошибка при seed контента:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
