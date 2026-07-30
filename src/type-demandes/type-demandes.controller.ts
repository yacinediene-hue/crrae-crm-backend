import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, Req, UseGuards,
} from '@nestjs/common';
import { TypeDemandesService } from './type-demandes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('type-demandes')
@UseGuards(JwtAuthGuard)
export class TypeDemandesController {
  constructor(private readonly svc: TypeDemandesService) {}

  // GET /type-demandes?actifOnly=true  — liste pour agents (formulaire)
  @Get()
  findAll(@Query('actifOnly') actifOnly?: string) {
    return this.svc.findAll(actifOnly === 'true');
  }

  // GET /type-demandes/:id/historique
  @Get(':id/historique')
  historique(@Param('id') id: string) {
    return this.svc.findHistorique(id);
  }

  // GET /type-demandes/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  // POST /type-demandes  — admin only
  @Post()
  create(@Body() body: any, @Req() req: any) {
    const auteur = req.user?.name ?? 'Admin';
    const auteurId = req.user?.id;
    return this.svc.create(body, auteur, auteurId);
  }

  // PATCH /type-demandes/:id  — admin only
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const auteur = req.user?.name ?? 'Admin';
    const auteurId = req.user?.id;
    return this.svc.update(id, body, auteur, auteurId);
  }

  // DELETE /type-demandes/:id  — admin only
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
