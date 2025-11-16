import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ContentService, LevelGenerationResponse } from './content.service';
import { LevelParamDto, PackParamDto } from './dto/level.dto';

@ApiTags('content')
@Controller('api/content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('packs')
  @ApiOperation({ summary: 'Получить все паки' })
  @ApiResponse({ status: 200, description: 'Список паков' })
  async getPacks() {
    return this.contentService.getPacks();
  }

  @Get('packs/:packId')
  @ApiOperation({ summary: 'Получить информацию о паке' })
  @ApiParam({ name: 'packId', description: 'ID пака', type: String })
  @ApiResponse({ status: 200, description: 'Данные пака' })
  @ApiResponse({ status: 404, description: 'Пак не найден' })
  async getPack(@Param() params: PackParamDto) {
    return this.contentService.getPack(params.packId);
  }

  @Get('levels/:levelId/generate')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Сгенерировать уровень' })
  @ApiParam({ name: 'levelId', description: 'ID уровня', type: String })
  @ApiResponse({ status: 200, description: 'Сгенерированный уровень' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Уровень не найден' })
  async generateLevel(
    @Request() req,
    @Param() params: LevelParamDto,
  ): Promise<LevelGenerationResponse> {
    return this.contentService.generateLevel(params.levelId, req.user.id);
  }
}
