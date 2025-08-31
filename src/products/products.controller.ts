import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { SnapshotDto } from './dto/snapshot.dto';
import { ParseLangPipe } from '../common/pipes/parse-lang.pipe';

@Controller('products')
export class ProductsController {
  constructor(private svc: ProductsService) {}

  // PUBLIC: submit URL → returns snapshot + series (frontend draws the chart)
  @Post('snapshot')
  snapshot(@Body() dto: SnapshotDto, @Query('lang', ParseLangPipe) lang: 'en'|'ar' = 'en') {
    return this.svc.snapshot(dto.url, lang);
  }

  // PUBLIC: read by id → current product + series
  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.getByIdPublic(id);
  }
}
