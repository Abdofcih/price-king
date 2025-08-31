import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('price_history')
@Index(['product', 'scrapedAt'])
export class PriceHistory {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Product, (p) => p.history, { onDelete: 'CASCADE' })
  product: Product;

  @Column({ type: 'numeric', nullable: true }) currentPrice: number | null;
  @Column({ type: 'numeric', nullable: true }) originalPrice: number | null;

  @CreateDateColumn() scrapedAt: Date;
}
