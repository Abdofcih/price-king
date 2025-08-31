import { Controller } from '@nestjs/common';
import { ScraperClientService } from './scraper-client.service';

@Controller('scraper-client')
export class ScraperClientController {
  constructor(private readonly scraperClientService: ScraperClientService) {}
}
