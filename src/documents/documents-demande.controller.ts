import { Controller, Get, Post, Delete, Param, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('demandes/:demandeId/documents')
export class DocumentsDemandeController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@Param('demandeId') demandeId: string) {
    return this.prisma.documentDemande.findMany({
      where: { demandeId },
      select: { id: true, nom: true, type: true, taille: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async upload(@Param('demandeId') demandeId: string, @Body() body: { nom: string; type: string; contenu: string }) {
    const buffer = Buffer.from(body.contenu, 'base64');
    return this.prisma.documentDemande.create({
      data: { demandeId, nom: body.nom, type: body.type, taille: buffer.length, contenu: buffer },
      select: { id: true, nom: true, type: true, taille: true, createdAt: true },
    });
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const doc = await this.prisma.documentDemande.findUnique({ where: { id } });
    if (!doc) return res.status(404).json({ error: 'Document introuvable' });
    res.set({ 'Content-Type': doc.type, 'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.nom)}"`, 'Content-Length': doc.taille.toString() });
    res.end(doc.contenu);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.prisma.documentDemande.delete({ where: { id } });
    return { success: true };
  }
}
