import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CommentairesService } from './commentaires.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('commentaires')
export class CommentairesController {
  constructor(private service: CommentairesService) {}

  @Get('demande/:demandeId')
  findByDemande(@Param('demandeId') demandeId: string) {
    return this.service.findByDemande(demandeId);
  }

  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
