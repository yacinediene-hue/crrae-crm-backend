import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('enquetes')
export class EnquetesController {
  constructor(private prisma: PrismaService) {}

  @Get(':token')
  async getEnquete(@Param('token') token: string) {
    const demande = await this.prisma.demande.findFirst({
      where: { numDemande: token },
      select: {
        id: true, numDemande: true, nomPrenom: true,
        objetDemande: true, statut: true, noteSatisfaction: true,
      }
    });
    if (!demande) return { error: 'Demande introuvable' };
    return demande;
  }

  @Post(':token')
  async submitEnquete(@Param('token') token: string, @Body() body: any) {
    const demande = await this.prisma.demande.findFirst({
      where: { numDemande: token }
    });
    if (!demande) return { error: 'Demande introuvable' };
    return this.prisma.demande.update({
      where: { id: demande.id },
      data: {
        noteSatisfaction: parseInt(body.note),
        commentaire: (demande.commentaire||'') + (body.avis ? `\n[Avis client]: ${body.avis}` : ''),
      }
    });
  }
}
