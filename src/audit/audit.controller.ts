import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private service: AuditService) {}

  @Get('logs')
  @Roles('admin', 'manager')
  getLogs(@Query() q: { auteur?: string; action?: string; entite?: string; depuis?: string; limit?: string }) {
    return this.service.getLogs({
      auteur: q.auteur,
      action: q.action,
      entite: q.entite,
      depuis: q.depuis,
      limit: q.limit ? parseInt(q.limit) : 500,
    });
  }

  @Get('stats')
  @Roles('admin', 'manager')
  getStats() {
    return this.service.getStats();
  }
}
