import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { Alert } from './entities/alert.entity';
import { Product } from '../products/entities/product.entity';
import { PriceHistory } from '../products/entities/price-history.entity';
import { EmailModule } from '../email/email.module';
import { AlertsProcessor } from './alerts.processor';
import { ScraperClientModule } from 'src/scraper-client/scraper-client.module';

@Module({
  imports: [TypeOrmModule.forFeature([Alert, Product, PriceHistory]), ScraperClientModule, EmailModule],
  providers: [AlertsService, AlertsProcessor],
  controllers: [AlertsController],
})
export class AlertsModule {}
