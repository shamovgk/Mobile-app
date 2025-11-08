import { Module } from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [ProgressController],
  providers: [ProgressService, PrismaService],
  exports: [ProgressService],
})
export class ProgressModule {}
