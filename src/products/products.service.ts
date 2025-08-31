import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PriceHistory } from './entities/price-history.entity';
import { ScraperService } from '../scrapers/scraper.service';

@Injectable()
export class ProductsService {
  constructor(
    private scraper: ScraperService,
    @InjectRepository(Product) private products: Repository<Product>,
    @InjectRepository(PriceHistory) private histories: Repository<PriceHistory>,
  ) {}

  private canonical(url: string) {
    // normalize to origin + /dp/ASIN, drop ref/query
    const u = new URL(url);
    const dp = u.pathname.match(/\/dp\/([A-Z0-9]{10})/i);
    const seg = dp ? `/dp/${dp[1].toUpperCase()}` : u.pathname;
    return `${u.origin}${seg}`;
  }

  async snapshot(url: string, lang: 'en'|'ar' = 'en') {
    const snap = await this.scraper.product(url, lang);

    const urlCanonical = this.canonical(snap.urlAtStore);
    let product = await this.products.findOne({ where: { urlCanonical } });

    if (!product) {
      product = this.products.create({
        urlCanonical,
        urlSubmitted: url,
        name: snap.name,
        imageUrl: snap.imageFromStore ?? null,
        lastPrice: snap.current_price ?? null,
        currency: 'SAR',
        lang,
      });
    } else {
      product.name = snap.name || product.name;
      product.imageUrl = snap.imageFromStore ?? product.imageUrl;
      product.lastPrice = snap.current_price ?? product.lastPrice;
      product.lang = lang;
    }
    product = await this.products.save(product);

    // append history
    await this.histories.save(this.histories.create({
      product,
      currentPrice: snap.current_price ?? null,
      originalPrice: snap.original_price ?? null,
    }));

    // return snapshot + series (public view)
    const series = await this.histories.find({
      where: { product: { id: product.id } },
      order: { scrapedAt: 'ASC' },
    });

    return {
      product: {
        id: product.id,
        url: product.urlCanonical,
        name: product.name,
        imageUrl: product.imageUrl,
        currency: product.currency,
        lang: product.lang,
        lastPrice: product.lastPrice,
      },
      snapshot: {
        current_price: snap.current_price,
        original_price: snap.original_price,
        scrapedAt: new Date(),
      },
      history: series.map(s => ({
        t: s.scrapedAt,
        price: s.currentPrice,
        original: s.originalPrice,
      })),
    };
  }

  async getByIdPublic(id: string) {
    const product = await this.products.findOne({ where: { id } });
    if (!product) return null;

    const series = await this.histories.find({
      where: { product: { id } },
      order: { scrapedAt: 'ASC' },
    });

    return {
      product: {
        id: product.id,
        url: product.urlCanonical,
        name: product.name,
        imageUrl: product.imageUrl,
        currency: product.currency,
        lang: product.lang,
        lastPrice: product.lastPrice,
      },
      history: series.map(s => ({ t: s.scrapedAt, price: s.currentPrice, original: s.originalPrice })),
    };
  }
}
