import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { EmailVerification } from './email-verification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index({ unique: true })
  @Column() email: string;

  @Column() name: string;
 
  @Column() passwordHash: string;

  @Column({ type: 'timestamptz', nullable: true }) emailVerifiedAt: Date | null;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  @OneToMany(() => EmailVerification, (v) => v.user) verifications: EmailVerification[];
}
