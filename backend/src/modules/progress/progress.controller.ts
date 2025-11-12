import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProgressService } from './progress.service';
import { SubmitResultDto } from './dto/submit-result.dto';

@Controller('api/progress')
@UseGuards(AuthGuard('jwt')) // Все endpoints защищены
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // POST /api/progress/submit
  @Post('submit')
  async submitResult(@Request() req, @Body() dto: SubmitResultDto) {
    return this.progressService.submitResult(req.user.id, dto);
  }

  // GET /api/progress/me
  @Get('me')
  async getMyProgress(@Request() req) {
    return this.progressService.getUserProgress(req.user.id);
  }

  // GET /api/progress/level/:levelId
  @Get('level/:levelId')
  async getLevelAttempts(@Request() req, @Param('levelId') levelId: string) {
    return this.progressService.getLevelAttempts(req.user.id, levelId);
  }

  @Get('dictionary')
  async getDictionary(@Request() req: any) {
    return this.progressService.getUserDictionary(req.user.id);
  }
}
