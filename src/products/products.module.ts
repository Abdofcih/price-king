import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { PriceHistory } from './entities/price-history.entity'
import { ScraperClientModule } from 'src/scraper-client/scraper-client.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, PriceHistory]),ScraperClientModule],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [TypeOrmModule],
})
export class ProductsModule {}
