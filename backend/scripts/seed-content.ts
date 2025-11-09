import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// JSON структуры
interface Lexeme {
  form: string;
  meaning: string;
  contexts: string[];
  difficulty?: number;
  audio?: string;
  image?: string;
}

interface Level {
  levelNumber: number;
  mode: string;
  difficulty: string;
  allowedTypes: string[];
  lexemes: Lexeme[];
}

interface PackData {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  order?: number;
  icon?: string;
  levels: Level[];
}

export async function seedContent(prisma: PrismaClient) {
  // Очистить существующие данные
  console.log('🗑️  Очистка старых данных...');
  await prisma.levelLexeme.deleteMany();
  await prisma.lexeme.deleteMany();
  await prisma.level.deleteMany();
  await prisma.pack.deleteMany();

  // JSON-файлы из /frontend/data/packs
  const packsDir = path.join(__dirname, '../../frontend/data/packs');
  
  if (!fs.existsSync(packsDir)) {
    throw new Error(`Директория паков не найдена: ${packsDir}`);
  }

  const packFiles = fs
    .readdirSync(packsDir)
    .filter((file) => file.endsWith('.json'));

  console.log(`📦 Найдено ${packFiles.length} паков\n`);

  for (const file of packFiles) {
    const filePath = path.join(packsDir, file);
    console.log(`📖 Обработка файла: ${file}`);

    const packData: PackData = JSON.parse(
      fs.readFileSync(filePath, 'utf-8')
    );

    const pack = await prisma.pack.create({
      data: {
        slug: packData.id,
        title: packData.title,
        description: packData.description,
        language: packData.language || 'en',
        difficulty: packData.difficulty,
        icon: packData.icon || null,
        order: packData.order || 0,
      },
    });

    console.log(`✅ Создан пак: ${pack.title} (ID: ${pack.id})`);

    for (const levelData of packData.levels) {
      const level = await prisma.level.create({
        data: {
          packId: pack.id,
          levelNumber: levelData.levelNumber,
          mode: levelData.mode,
          difficulty: levelData.difficulty,
        },
      });

      console.log(`   ├─ Уровень ${level.levelNumber} (${levelData.allowedTypes.join(', ')})`);

      for (const lexemeData of levelData.lexemes) {
        let lexeme = await prisma.lexeme.findFirst({
          where: { form: lexemeData.form },
        });

        if (!lexeme) {
          lexeme = await prisma.lexeme.create({
            data: {
              form: lexemeData.form,
              meaning: lexemeData.meaning,
              contexts: lexemeData.contexts,
              difficulty: lexemeData.difficulty || 1,
              audio: lexemeData.audio || null,
              image: lexemeData.image || null,
            },
          });
          console.log(`      ├─ Создана лексема: ${lexeme.form}`);
        } else {
          console.log(`      ├─ Лексема уже есть: ${lexeme.form}`);
        }

        await prisma.levelLexeme.create({
          data: {
            levelId: level.id,
            lexemeId: lexeme.id,
          },
        });
      }

      console.log(`   └─ Добавлено ${levelData.lexemes.length} слов`);
    }

    console.log(`✅ Завершён пак: ${packData.levels.length} уровней\n`);
  }
}

// Если файл запускается напрямую
if (require.main === module) {
  const prisma = new PrismaClient();
  seedContent(prisma)
    .catch((e) => {
      console.error('❌ Ошибка seed контента:');
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
