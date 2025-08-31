import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PriceHistory } from './price-history.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index({ unique: true })
  @Column() urlCanonical: string;   // canonical dp link (/-/en/.. or /-/ar/.. normalized)

  @Column() urlSubmitted: string;

  @Column({ default: 'en' }) lang: 'en'|'ar';

  @Column() name: string;

  @Column({ nullable: true }) imageUrl: string | null;

  @Column({ type: 'numeric', nullable: true }) lastPrice: number | null;

  @Column({ default: 'SAR' }) currency: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  @OneToMany(() => PriceHistory, (ph) => ph.product) history: PriceHistory[];
}
