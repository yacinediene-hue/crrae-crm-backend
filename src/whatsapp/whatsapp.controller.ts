import { Controller, Get, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('whatsapp')
export class WhatsappController {
  constructor(private service: WhatsappService) {}

  @Get('status')
  getStatus() { return this.service.getStatus(); }
}
