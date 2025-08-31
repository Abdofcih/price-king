import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { ScraperService } from '../scrapers/scraper.service';
import { EmailService } from '../email/email.service';
import { PriceHistory } from '../products/entities/price-history.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class AlertsProcessor {
  private readonly logger = new Logger(AlertsProcessor.name);

  constructor(
    @InjectRepository(Alert) private alerts: Repository<Alert>,
    @InjectRepository(Product) private products: Repository<Product>,
    @InjectRepository(PriceHistory) private histories: Repository<PriceHistory>,
    private scraper: ScraperService,
    private email: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_15_MINUTES)
  async checkAlerts() {
    const active = await this.alerts.find({ where: { active: true }, relations: ['user', 'product'] });
    for (const alert of active) {
      try {
        const lang = (alert.product.lang as 'en'|'ar') || 'en';
        const snap = await this.scraper.product(alert.product.urlCanonical, lang);

        // Save history + update product
        await this.histories.save(this.histories.create({
          product: alert.product, currentPrice: snap.current_price ?? null, originalPrice: snap.original_price ?? null,
        }));
        alert.product.lastPrice = snap.current_price ?? alert.product.lastPrice;
        await this.products.save(alert.product);

        const price = snap.current_price;
        if (price !== null && price <= alert.targetPrice) {
          const cooloff = alert.lastTriggeredAt ? Date.now() - alert.lastTriggeredAt.getTime() : Infinity;
          if (cooloff > 1000 * 60 * 60 * 6) { // 6h cooldown
            await this.email.sendAlertEmail(alert.user.email, {
              productName: alert.product.name,
              productUrl: alert.product.urlCanonical,
              currentPrice: price,
              targetPrice: alert.targetPrice,
            });
            alert.lastTriggeredAt = new Date();
            await this.alerts.save(alert);
          }
        }
      } catch (e) {
        this.logger.warn(`Alert check failed for ${alert.id}: ${e instanceof Error ? e.message : e}`);
      }
    }
  }
}
