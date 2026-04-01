import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from '../audit/audit.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(private service: UsersService, private audit: AuditService) {}

  @Get()
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  async create(@Body() body: any, @Request() req: any) {
    const result = await this.service.create(body);
    this.audit.log({ auteur: req.user.email, auteurId: req.user.id, action: 'CREATE_USER', entite: 'User', entiteId: result.id, detail: `Création de ${result.email} (rôle: ${result.role})` });
    return result;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const result = await this.service.update(id, body);
    if (body.password) {
      this.audit.log({ auteur: req.user.email, auteurId: req.user.id, action: 'CHANGE_PASSWORD', entite: 'User', entiteId: id, detail: `Changement de mot de passe pour ${result.email}` });
    } else {
      this.audit.log({ auteur: req.user.email, auteurId: req.user.id, action: 'UPDATE_USER', entite: 'User', entiteId: id, detail: `Modification de ${result.email}` });
    }
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const target = await this.service.findOne(id);
    const result = await this.service.remove(id);
    this.audit.log({ auteur: req.user.email, auteurId: req.user.id, action: 'DELETE_USER', entite: 'User', entiteId: id, detail: `Suppression de ${target.email}` });
    return result;
  }
}
