import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AlertesService } from './alertes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('alertes')
export class AlertesController {
  constructor(private service: AlertesService) {}

  @Post('sla')
  @Roles('admin', 'manager')
  async declencherAlertesSla(@Request() req: any) {
    const count = await this.service.envoyerAlertesSla();
    return { message: `${count} alerte(s) envoyée(s)`, count };
  }
}
