import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { EmailVerification } from './entities/email-verification.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(EmailVerification) private verifs: Repository<EmailVerification>,
    private email: EmailService,
  ) {}

  async register(email: string, password: string) {
    const exists = await this.users.findOne({ where: { email } });
    if (exists) throw new BadRequestException('Email already registered');

    const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS || 10));
    const user = await this.users.save(this.users.create({ email, passwordHash, emailVerifiedAt: null }));

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
    await this.verifs.save(this.verifs.create({ user, token, expiresAt, usedAt: null }));
    await this.email.sendVerificationEmail(email, token);

    return { id: user.id, email: user.email };
  }

  async verifyEmail(token: string) {
    const row = await this.verifs.findOne({ where: { token }, relations: ['user'] });
    if (!row || row.usedAt || row.expiresAt < new Date()) throw new BadRequestException('Invalid or expired token');

    row.usedAt = new Date();
    await this.verifs.save(row);

    row.user.emailVerifiedAt = new Date();
    await this.users.save(row.user);

    return { ok: true };
  }

  async login(email: string, password: string) {
    const user = await this.users.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException();

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException();

    const token = jwt.sign({
      sub: user.id,
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt,
    }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES || '7d' });

    return { access_token: token };
  }
}
