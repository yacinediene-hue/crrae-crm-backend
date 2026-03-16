import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DemandesService {
  constructor(private prisma: PrismaService) {}

  findAll(query?: any) {
    const where: any = {};
    if (query?.statut) where.statut = query.statut;
    if (query?.service) where.service = query.service;
    return this.prisma.demande.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.demande.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Demande ${id} introuvable`);
    return item;
  }

  async create(data: any) {
    const count = await this.prisma.demande.count();
    const numDemande = `DEMS-${String(count + 1).padStart(5, '0')}`;
    let delaiTraitement: number | undefined;
    let respectDelai: string | undefined;
    if (data.dateReception && data.dateTraitement) {
      const d1 = new Date(data.dateReception);
      const d2 = new Date(data.dateTraitement);
      delaiTraitement = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      const delaisService: Record<string, number> = { DPM: 3, DPR: 5, DSI: 6, PATRIMOINE: 7, DCR: 5, REGISSEUR: 5 };
      const delaiMax = delaisService[data.service] ?? 3;
      respectDelai = delaiTraitement <= delaiMax ? 'OUI' : 'NON';
    }
    return this.prisma.demande.create({
      data: {
        ...data,
        numDemande,
        delaiTraitement,
        respectDelai,
        dateReception: data.dateReception ? new Date(data.dateReception) : null,
        dateTraitement: data.dateTraitement ? new Date(data.dateTraitement) : null,
        noteSatisfaction: data.noteSatisfaction ? parseInt(data.noteSatisfaction) : null,
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.demande.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.demande.delete({ where: { id } });
  }
}
