import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { Alert } from './entities/alert.entity';
import { Product } from '../products/entities/product.entity';
import { PriceHistory } from '../products/entities/price-history.entity';
import { ScraperModule } from '../scrapers/scraper.module';
import { EmailModule } from '../email/email.module';
import { AlertsProcessor } from './alerts.processor';

@Module({
  imports: [TypeOrmModule.forFeature([Alert, Product, PriceHistory]), ScraperModule, EmailModule],
  providers: [AlertsService, AlertsProcessor],
  controllers: [AlertsController],
})
export class AlertsModule {}
