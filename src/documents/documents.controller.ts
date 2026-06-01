import { Controller, Get, Post, Delete, Param, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('deals/:dealId/documents')
export class DocumentsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list(@Param('dealId') dealId: string) {
    const docs = await this.prisma.pieceJointe.findMany({
      where: { dealId },
      select: { id: true, nom: true, type: true, taille: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return docs;
  }

  @Post()
  async upload(@Param('dealId') dealId: string, @Body() body: { nom: string; type: string; contenu: string }) {
    const buffer = Buffer.from(body.contenu, 'base64');
    const doc = await this.prisma.pieceJointe.create({
      data: {
        dealId,
        nom:     body.nom,
        type:    body.type,
        taille:  buffer.length,
        contenu: buffer,
      },
      select: { id: true, nom: true, type: true, taille: true, createdAt: true },
    });
    return doc;
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const doc = await this.prisma.pieceJointe.findUnique({ where: { id } });
    if (!doc) return res.status(404).json({ error: 'Document introuvable' });
    res.set({
      'Content-Type':        doc.type,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.nom)}"`,
      'Content-Length':      doc.taille.toString(),
    });
    res.end(doc.contenu);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.prisma.pieceJointe.delete({ where: { id } });
    return { success: true };
  }
}
