import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { DemandesService } from './demandes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from '../audit/audit.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('demandes')
export class DemandesController {
  constructor(private service: DemandesService, private audit: AuditService) {}

  @Get()
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Post(':id/send-survey')
  sendSurvey(@Param('id') id: string, @Request() req: any) {
    return this.service.sendSurvey(id, req.user);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  async remove(@Param('id') id: string, @Request() req: any) {
    const result = await this.service.remove(id);
    this.audit.log({ auteur: req.user.email, auteurId: req.user.id, action: 'DELETE_DEMANDE', entite: 'Demande', entiteId: id });
    return result;
  }
}
