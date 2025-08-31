import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('email_verifications')
export class EmailVerification {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => User, (u) => u.verifications, { onDelete: 'CASCADE' })
  user: User;

  @Index()
  @Column({ unique: true }) token: string;

  @Column({ type: 'timestamptz' }) expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true }) usedAt: Date | null;

  @CreateDateColumn() createdAt: Date;
}
