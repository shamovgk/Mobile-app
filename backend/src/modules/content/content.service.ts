import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/logger/logger.service';
import { Lexeme, Level, Pack } from '@prisma/client';

type QuestionType = 'meaning' | 'form' | 'context' | 'anagram';

export interface GeneratedQuestion {
  type: QuestionType;
  lexemeId: string;
  prompt: string;
  correctAnswer: string;
  options?: string[];
  context?: string;
}

export interface LevelGenerationResponse {
  id: string;
  levelNumber: number;
  mode: string;
  difficulty: string;
  timeLimit: number | null;
  lives: number | null;
  targetScore: number;
  seed: number;
  questions: GeneratedQuestion[];
  lexemes: Array<{
    id: string;
    form: string;
    meaning: string;
    contexts: string[];
    difficulty: number;
  }>;
}

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async getPacks() {
    this.logger.log('Fetching all packs', 'ContentService');

    const packs = await this.prisma.pack.findMany({
      include: {
        _count: {
          select: { levels: true },
        },
      },
    });

    this.logger.log(`Fetched ${packs.length} packs`, 'ContentService');

    return packs.map((pack) => ({
      id: pack.id,
      title: pack.title,
      slug: pack.slug,
      description: pack.description,
      icon: pack.icon,
      difficulty: pack.difficulty,
      levelsCount: pack._count.levels,
    }));
  }

  async getPack(packId: string) {
    this.logger.log(`Fetching pack: ${packId}`, 'ContentService');

    const pack = await this.prisma.pack.findUnique({
      where: { id: packId },
      include: {
        levels: {
          orderBy: { levelNumber: 'asc' },
          include: {
            _count: {
              select: { lexemes: true },
            },
          },
        },
      },
    });

    if (!pack) {
      this.logger.error(`Pack not found: ${packId}`, '', 'ContentService');
      throw new NotFoundException(`Pack ${packId} not found`);
    }

    this.logger.log(`Pack fetched: ${pack.title} (${pack.levels.length} levels)`, 'ContentService');

    return {
      id: pack.id,
      title: pack.title,
      slug: pack.slug,
      description: pack.description,
      levels: pack.levels.map((level) => ({
        id: level.id,
        levelNumber: level.levelNumber,
        mode: level.mode,
        difficulty: level.difficulty,
        timeLimit: level.timeLimit,
        lives: level.lives,
        targetScore: level.targetScore,
        lexemesCount: level._count.lexemes,
      })),
    };
  }

  async generateLevel(
    levelId: string,
    userId: string,
  ): Promise<LevelGenerationResponse> {
    this.logger.log(`Generating level ${levelId} for user ${userId}`, 'ContentService');

    const level = await this.prisma.level.findUnique({
      where: { id: levelId },
      include: {
        lexemes: {
          include: {
            lexeme: true,
          },
        },
        pack: {
          include: {
            lexemes: true,
          },
        },
      },
    });

    if (!level) {
      this.logger.error(`Level not found: ${levelId}`, '', 'ContentService');
      throw new NotFoundException(`Level ${levelId} not found`);
    }

    const attemptCount = await this.prisma.levelAttempt.count({
      where: { userId, levelId },
    });

    const seed = this.generateSeed(userId, attemptCount + 1);
    const rng = this.createSeededRandom(seed);

    this.logger.debug(
      `Level generation params - attempt: ${attemptCount + 1}, seed: ${seed}`,
      'ContentService',
    );

    const levelLexemes = this.seededShuffle(
      level.lexemes.map((ll) => ll.lexeme),
      rng,
    );

    const questions: GeneratedQuestion[] = [];
    const questionTypes: QuestionType[] = ['meaning', 'form', 'context', 'anagram'];

    for (const lexeme of levelLexemes) {
      const type = questionTypes[Math.floor(rng() * questionTypes.length)];
      const question = this.generateQuestion(
        type,
        lexeme,
        level.pack.lexemes,
        rng,
      );
      
      if (question) {
        questions.push(question);
      }
    }

    this.logger.log(
      `Level ${levelId} generated: ${questions.length} questions, seed: ${seed}`,
      'ContentService',
    );

    return {
      id: level.id,
      levelNumber: level.levelNumber,
      mode: level.mode,
      difficulty: level.difficulty,
      timeLimit: level.timeLimit,
      lives: level.lives,
      targetScore: level.targetScore,
      seed,
      questions,
      lexemes: levelLexemes.map((l) => ({
        id: l.id,
        form: l.form,
        meaning: l.meaning,
        contexts: l.contexts,
        difficulty: l.difficulty,
      })),
    };
  }

  private generateChoiceQuestion(
    type: 'meaning' | 'form',
    lexeme: Lexeme,
    allLexemes: Lexeme[],
    rng: () => number,
  ): GeneratedQuestion {
    const isMeaning = type === 'meaning';
    const correctAnswer = isMeaning ? lexeme.meaning : lexeme.form;
    const prompt = isMeaning ? lexeme.form : lexeme.meaning;
    
    const distractorPool = allLexemes
      .filter((l) => l.id !== lexeme.id)
      .map((l) => (isMeaning ? l.meaning : l.form));

    const shuffled = this.seededShuffle([...distractorPool], rng);
    const distractors = shuffled.slice(0, 3);
    const options = this.seededShuffle([correctAnswer, ...distractors], rng);

    return {
      type,
      lexemeId: lexeme.id,
      prompt,
      correctAnswer,
      options,
    };
  }

  private generateQuestion(
    type: QuestionType,
    lexeme: Lexeme,
    allPackLexemes: Lexeme[],
    rng: () => number,
  ): GeneratedQuestion | null {
    switch (type) {
      case 'meaning':
        return this.generateChoiceQuestion('meaning', lexeme, allPackLexemes, rng);
      
      case 'form':
        return this.generateChoiceQuestion('form', lexeme, allPackLexemes, rng);
      
      case 'context':
        return this.generateContextQuestion(lexeme, rng);
      
      case 'anagram':
        return this.generateAnagramQuestion(lexeme);
      
      default:
        this.logger.warn(`Unknown question type: ${type}`, 'ContentService');
        return null;
    }
  }

  private generateContextQuestion(
    lexeme: Lexeme,
    rng: () => number,
  ): GeneratedQuestion | null {
    if (!lexeme.contexts || lexeme.contexts.length === 0) {
      this.logger.debug(`No contexts available for lexeme: ${lexeme.id}`, 'ContentService');
      return null;
    }

    const context = lexeme.contexts[Math.floor(rng() * lexeme.contexts.length)];
    const correctAnswer = lexeme.form;
    const pattern = new RegExp(correctAnswer, 'gi');
    const prompt = context.replace(pattern, '___');

    return {
      type: 'context',
      lexemeId: lexeme.id,
      prompt,
      correctAnswer,
      context,
    };
  }

  private generateAnagramQuestion(lexeme: Lexeme): GeneratedQuestion {
    return {
      type: 'anagram',
      lexemeId: lexeme.id,
      prompt: lexeme.meaning,
      correctAnswer: lexeme.form,
    };
  }

  private generateSeed(userId: string, attemptNumber: number): number {
    const userHash = this.hashString(userId);
    return (userHash + attemptNumber * 1000000) % 2147483647;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private createSeededRandom(seed: number): () => number {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  private seededShuffle<T>(array: T[], rng: () => number): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
