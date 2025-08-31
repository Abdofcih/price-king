import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScraperClientService } from './scraper-client.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        baseURL: cfg.get<string>('SCRAPER_BASE_URL', 'http://localhost:3001'),
        timeout: Number(cfg.get<string>('SCRAPER_TIMEOUT_MS', '12000')),
        maxRedirects: 3,
        validateStatus: (s) => s >= 200 && s < 500, // we handle 4xx as errors ourselves
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ScraperClientService],
  exports: [ScraperClientService],
})
export class ScraperClientModule {}
