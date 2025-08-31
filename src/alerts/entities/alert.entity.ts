import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('alerts')
@Index(['user', 'product'], { unique: true })
export class Alert {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' }) user: User;
  @ManyToOne(() => Product, { onDelete: 'CASCADE' }) product: Product;

  @Column({ type: 'numeric' }) targetPrice: number;

  @Column({ default: true }) active: boolean;

  @Column({ type: 'timestamptz', nullable: true }) lastTriggeredAt: Date | null;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
