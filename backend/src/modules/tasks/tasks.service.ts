import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOldGuests() {
    this.logger.log('Starting cleanup of old guest users', 'TasksService');
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.prisma.guestUser.deleteMany({
        where: { createdAt: { lt: thirtyDaysAgo } },
      });

      this.logger.log(
        `Cleaned up ${result.count} guest users older than 30 days`,
        'TasksService',
      );
    } catch (error) {
      this.logger.error(
        'Failed to cleanup old guest users',
        error instanceof Error ? error.stack : '',
        'TasksService',
      );
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOldAttempts() {
    this.logger.log('Starting cleanup of old attempts', 'TasksService');
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const result = await this.prisma.levelAttempt.deleteMany({
        where: { completedAt: { lt: ninetyDaysAgo } },
      });

      this.logger.log(
        `Cleaned up ${result.count} old level attempts`,
        'TasksService',
      );
    } catch (error) {
      this.logger.error(
        'Failed to cleanup old attempts',
        error instanceof Error ? error.stack : '',
        'TasksService',
      );
    }
  }
}
