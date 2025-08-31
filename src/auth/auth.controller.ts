import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private svc: AuthService) {}

  @Post('register') register(@Body() dto: RegisterDto) {
    return this.svc.register(dto.email, dto.password);
  }

  @Get('verify-email') verify(@Query('token') token: string) {
    return this.svc.verifyEmail(token);
  }

  @Post('login') login(@Body() dto: LoginDto) {
    return this.svc.login(dto.email, dto.password);
  }
}
