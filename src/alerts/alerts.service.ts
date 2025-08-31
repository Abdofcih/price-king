import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert) private alerts: Repository<Alert>,
    @InjectRepository(Product) private products: Repository<Product>,
  ) {}

  async create(user: User, productId: string, targetPrice: number) {
    const product = await this.products.findOne({ where: { id: productId } });
    if (!product) throw new BadRequestException('Product not found');

    const exists = await this.alerts.findOne({ where: { user: { id: user.id }, product: { id: product.id } } });
    if (exists) throw new BadRequestException('Alert already exists for this product');

    return this.alerts.save(this.alerts.create({ user, product, targetPrice, active: true, lastTriggeredAt: null }));
  }

  list(user: User) {
    return this.alerts.find({ where: { user: { id: user.id } }, relations: ['product'] });
  }

  async remove(user: User, id: string) {
    const alert = await this.alerts.findOne({ where: { id }, relations: ['user'] });
    if (!alert || alert.user.id !== user.id) throw new BadRequestException('Alert not found');
    await this.alerts.remove(alert);
    return { ok: true };
  }
}
