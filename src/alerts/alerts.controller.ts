import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { AuthGuard } from '@nestjs/passport';
import { EmailVerifiedGuard } from '../common/guards/email-verified.guard';

@Controller('alerts')
@UseGuards(AuthGuard('jwt'))
export class AlertsController {
  constructor(private svc: AlertsService) {}

  @Get() list(@Req() req: any) { return this.svc.list({ id: req.user.sub } as any); }

  // creating alerts requires verified email
  @UseGuards(EmailVerifiedGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateAlertDto) {
    return this.svc.create({ id: req.user.sub } as any, dto.productId, dto.targetPrice);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.svc.remove({ id: req.user.sub } as any, id);
  }
}
