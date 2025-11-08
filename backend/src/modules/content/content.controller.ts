import { Controller, Get, Param } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('api/content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // GET /api/content/packs
  @Get('packs')
  async getPacks() {
    return this.contentService.getAllPacks();
  }

  // GET /api/content/packs/:packId
  @Get('packs/:packId')
  async getPack(@Param('packId') packId: string) {
    return this.contentService.getPackById(packId);
  }

  // GET /api/content/levels/:levelId
  @Get('levels/:levelId')
  async getLevel(@Param('levelId') levelId: string) {
    return this.contentService.getLevelById(levelId);
  }
}
