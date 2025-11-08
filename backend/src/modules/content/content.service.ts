import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  // Получить все паки
  async getAllPacks() {
    const packs = await this.prisma.pack.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { levels: true }, // Считаем количество уровней
        },
      },
    });

    return packs.map((pack) => ({
      id: pack.id,
      slug: pack.slug,
      title: pack.title,
      description: pack.description,
      language: pack.language,
      difficulty: pack.difficulty,
      icon: pack.icon,
      order: pack.order,
      levelsCount: pack._count.levels,
    }));
  }

  // Получить детали пака с уровнями
  async getPackById(packId: string) {
    const pack = await this.prisma.pack.findUnique({
      where: { id: packId },
      include: {
        levels: {
          orderBy: { levelNumber: 'asc' },
          include: {
            _count: {
              select: { lexemes: true }, // Считаем слова в каждом уровне
            },
          },
        },
      },
    });

    if (!pack) {
      throw new NotFoundException(`Пак с ID ${packId} не найден`);
    }

    return {
      id: pack.id,
      slug: pack.slug,
      title: pack.title,
      description: pack.description,
      language: pack.language,
      difficulty: pack.difficulty,
      icon: pack.icon,
      levels: pack.levels.map((level) => ({
        id: level.id,
        levelNumber: level.levelNumber,
        mode: level.mode,
        difficulty: level.difficulty,
        lexemesCount: level._count.lexemes,
      })),
    };
  }

  // Получить детали уровня с лексемами
  async getLevelById(levelId: string) {
    const level = await this.prisma.level.findUnique({
      where: { id: levelId },
      include: {
        pack: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        lexemes: {
          include: {
            lexeme: true, // Получаем полные данные лексем
          },
        },
      },
    });

    if (!level) {
      throw new NotFoundException(`Уровень с ID ${levelId} не найден`);
    }

    return {
      id: level.id,
      levelNumber: level.levelNumber,
      mode: level.mode,
      difficulty: level.difficulty,
      pack: level.pack,
      lexemes: level.lexemes.map((ll) => ({
        id: ll.lexeme.id,
        form: ll.lexeme.form,
        meaning: ll.lexeme.meaning,
        contexts: ll.lexeme.contexts,
        difficulty: ll.lexeme.difficulty,
        audio: ll.lexeme.audio,
        image: ll.lexeme.image,
      })),
    };
  }
}
