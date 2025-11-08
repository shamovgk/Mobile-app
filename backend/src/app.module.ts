import { Module } from '@nestjs/common';
import { ContentModule } from './modules/content/content.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProgressModule } from './modules/progress/progress.module';

@Module({
  imports: [
    ContentModule,
    AuthModule,
    ProgressModule,
  ],
})
export class AppModule {}
