import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { 
  HealthCheck, 
  HealthCheckService, 
  PrismaHealthIndicator, 
  MemoryHealthIndicator,
  DiskHealthIndicator 
} from '@nestjs/terminus';
import { PrismaService } from '../../database/prisma.service';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('health')
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ 
    summary: 'Health check приложения',
    description: 'Проверяет состояние базы данных, памяти и дискового пространства'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Приложение работает нормально',
  })
  @ApiResponse({ status: 503, description: 'Сервис недоступен' })
  check() {
    return this.health.check([
      // ✅ Проверка подключения к БД
      () => this.prismaHealth.pingCheck('database', this.prisma),
      
      // ✅ Проверка использования памяти (heap < 150MB)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      
      // ✅ Проверка RSS памяти (< 300MB)
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
      
      // ✅ ИСПРАВЛЕНО: для Windows используем C:\ вместо /
      () =>
        this.disk.checkStorage('storage', {
          path: process.platform === 'win32' ? 'C:\\' : '/',
          thresholdPercent: 0.5,
        }),
    ]);
  }
}
