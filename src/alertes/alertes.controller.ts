import { Controller, Post, UseGuards } from '@nestjs/common';
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
  async declencherAlertesSla() {
    const count = await this.service.envoyerAlertesSla();
    return { message: `${count} alerte(s) SLA hors délai envoyée(s)`, count };
  }

  @Post('approche-delai')
  @Roles('admin', 'manager')
  async declencherAlerteApprocheDelai() {
    const count = await this.service.verifierApprocheDelai();
    return { message: `${count} alerte(s) approche délai envoyée(s)`, count };
  }

  @Post('relance')
  @Roles('admin', 'manager')
  async declencherRelances() {
    const count = await this.service.relancerAgents();
    return { message: `${count} relance(s) envoyée(s) aux agents`, count };
  }
}
