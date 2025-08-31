import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });

  async send(to: string, subject: string, html: string) {
    const from = process.env.EMAIL_FROM!;
    await this.transporter.sendMail({ from, to, subject, html });
    this.logger.log(`Email sent to ${to} - ${subject}`);
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `${process.env.APP_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;
    return this.send(email, 'Verify your email', `
      <p>Verify your email to enable price alerts:</p>
      <p><a href="${url}">${url}</a></p>
    `);
  }

  async sendAlertEmail(email: string, payload: {
    productName: string, productUrl: string, currentPrice: number, targetPrice: number
  }) {
    const { productName, productUrl, currentPrice, targetPrice } = payload;
    return this.send(email, `Price alert: ${productName}`, `
      <h3>${productName}</h3>
      <p>Current price: <b>${currentPrice}</b> (target: ${targetPrice})</p>
      <p><a href="${productUrl}">View product</a></p>
    `);
  }
}
