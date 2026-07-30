import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TypeDemandesService {
  constructor(private prisma: PrismaService) {}

  async findAll(actifOnly = false) {
    return this.prisma.typeDemande.findMany({
      where: actifOnly ? { actif: true } : undefined,
      orderBy: { libelle: 'asc' },
    });
  }

  async findOne(id: string) {
    const td = await this.prisma.typeDemande.findUnique({ where: { id } });
    if (!td) throw new NotFoundException('TypeDemande introuvable');
    return td;
  }

  async findHistorique(id: string) {
    await this.findOne(id);
    return this.prisma.historiqueTypeDemande.findMany({
      where: { typeDemandeId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any, auteur: string, auteurId?: string) {
    if (!data.slug || !data.libelle) {
      throw new BadRequestException('slug et libelle sont requis');
    }
    const existing = await this.prisma.typeDemande.findUnique({ where: { slug: data.slug } });
    if (existing) throw new BadRequestException('Ce slug existe déjà');

    return this.prisma.typeDemande.create({
      data: {
        slug: data.slug,
        libelle: data.libelle,
        delaiMaxJours: data.delaiMaxJours ?? null,
        actif: data.actif ?? true,
        notes: data.notes ?? null,
      },
    });
  }

  async update(id: string, data: any, auteur: string, auteurId?: string) {
    const td = await this.findOne(id);
    const champs = ['libelle', 'delaiMaxJours', 'actif', 'notes', 'slug'];
    const historique: any[] = [];

    for (const champ of champs) {
      if (champ in data && String(data[champ]) !== String((td as any)[champ])) {
        historique.push({
          typeDemandeId: id,
          auteur,
          auteurId: auteurId ?? null,
          champ,
          ancienneValeur: (td as any)[champ] != null ? String((td as any)[champ]) : null,
          nouvelleValeur: data[champ] != null ? String(data[champ]) : null,
        });
      }
    }

    const updated = await this.prisma.typeDemande.update({
      where: { id },
      data: {
        ...(data.libelle !== undefined && { libelle: data.libelle }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.delaiMaxJours !== undefined && { delaiMaxJours: data.delaiMaxJours }),
        ...(data.actif !== undefined && { actif: data.actif }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    if (historique.length > 0) {
      await this.prisma.historiqueTypeDemande.createMany({ data: historique });
    }

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    const count = await this.prisma.demande.count({ where: { typeDemandeId: id } });
    if (count > 0) {
      throw new BadRequestException(
        `Ce type est utilisé par ${count} demande(s) — désactivez-le plutôt que le supprimer`,
      );
    }
    return this.prisma.typeDemande.delete({ where: { id } });
  }
}
