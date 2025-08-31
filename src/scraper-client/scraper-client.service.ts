import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export type StoreResult = {
  store: string;
  urlAtStore: string;
  name: string;
  current_price: number | null;
  original_price: number | null;
  imageFromStore: string | null;
};

@Injectable()
export class ScraperClientService {
  private readonly logger = new Logger(ScraperClientService.name);
  private readonly apiKey?: string;
  private readonly retries: number;

  constructor(private http: HttpService, cfg: ConfigService) {
    this.apiKey = cfg.get<string>('SCRAPER_API_KEY');
    this.retries = Number(cfg.get<string>('SCRAPER_RETRIES', '2'));
  }

  private async getWithRetry<T>(url: string, params: Record<string, any>): Promise<T> {
    let lastErr: any;
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const { data, status } = await firstValueFrom(
          this.http.get<T>(url, {
            params,
            headers: this.apiKey ? { 'x-api-key': this.apiKey } : undefined,
          }),
        );

        if (status >= 200 && status < 300) return data;

        // transient?
        if (status >= 500 || status === 429) throw new Error(`HTTP ${status}`);
        // non-transient (4xx other than 429)
        throw new InternalServerErrorException(`Scraper error ${status}`);
      } catch (err) {
        lastErr = err;
        const backoff = 300 * Math.pow(2, attempt);
        if (attempt < this.retries) {
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }
      }
    }
    this.logger.error(`Scraper request failed after retries: ${lastErr?.message || lastErr}`);
    throw new InternalServerErrorException('Upstream scraper unavailable');
  }

  /**
   * Fetch a single product snapshot from the scraper microservice.
   * The scraper endpoint must return StoreResult.
   */
  async fetchProduct(url: string, lang: 'en' | 'ar' = 'en'): Promise<StoreResult> {
    // Call: GET /search/product?url=&lang=
    const data = await this.getWithRetry<StoreResult>('/search/product', { url, lang });

    // Minimal runtime shape check (defensive)
    if (!data || typeof data !== 'object' || !('urlAtStore' in data) || !('name' in data)) {
      throw new InternalServerErrorException('Invalid scraper response shape');
    }
    return data;
  }
}
