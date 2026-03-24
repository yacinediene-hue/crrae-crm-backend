import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class DemandesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  private computePriorite(data: any): string {
    if (data.respectDelai === 'NON') return 'Critique';
    if (data.objetDemande === 'Réclamation') return 'Élevée';
    return 'Normale';
  }

  private computeDelaiAndRespect(data: any) {
    let delaiTraitement: number | null = null;
    let respectDelai: string | null = null;

    if (data.dateReception && data.dateTraitement) {
      const d1 = new Date(data.dateReception);
      const d2 = new Date(data.dateTraitement);

      delaiTraitement = Math.ceil(
        (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24),
      );

      const delaisService: Record<string, number> = {
        DPM: 3,
        DPR: 5,
        DSI: 6,
        PATRIMOINE: 7,
        DCR: 5,
        REGISSEUR: 5,
      };

      const delaiMax = delaisService[data.service] ?? 3;
      respectDelai = delaiTraitement <= delaiMax ? 'OUI' : 'NON';
    }

    return { delaiTraitement, respectDelai };
  }

  findAll(query?: any) {
    const where: any = {};

    if (query?.statut) where.statut = query.statut;
    if (query?.service) where.service = query.service;
    if (query?.canal) where.canal = query.canal;
    if (query?.typeClient) where.typeClient = query.typeClient;

    return this.prisma.demande.findMany({
      where,
      orderBy: { createdAt: 'desc' },

    });
  }

  async findOne(id: string) {
    const item = await this.prisma.demande.findUnique({
      where: { id },
  
    });

    if (!item) {
      throw new NotFoundException(`Demande ${id} introuvable`);
    }

    return item;
  }

  async create(data: any) {
    const count = await this.prisma.demande.count();
    const numDemande = `DEMS-${String(count + 1).padStart(5, '0')}`;

    const dateReception = data.dateReception ? new Date(data.dateReception) : null;
    const dateTraitement = data.dateTraitement ? new Date(data.dateTraitement) : null;
    const noteSatisfaction = data.noteSatisfaction
      ? parseInt(data.noteSatisfaction, 10)
      : null;

    const computedData = {
      ...data,
      dateReception,
      dateTraitement,
    };

    const metrics = this.computeDelaiAndRespect(computedData);

    const priorite = this.computePriorite({
      ...computedData,
      ...metrics,
    });

    const demande = await this.prisma.demande.create({
      data: {
        ...data,
        numDemande,
        dateReception,
        dateTraitement,
        noteSatisfaction,
        delaiTraitement: metrics.delaiTraitement,
        respectDelai: metrics.respectDelai,
        priorite,
      },
    });

    await this.prisma.timeline.create({
      data: {
        demandeId: demande.id,
        auteur: data.agentN1 || 'Système',
        action: 'Demande créée',
        canal: data.canal || 'CRM',
        detail: `Objet: ${data.objetDemande || 'Non précisé'} — Statut initial: ${data.statut || 'En cours'}`,
      },
    });

    if (demande.email) {
      await this.emailService.envoyerAccuseReception(
        demande.email,
        demande.numDemande,
        demande.nomPrenom,
      );
    }

    return demande;
  }

  async update(id: string, data: any) {
    const existing = await this.findOne(id);

    const mergedData = {
      ...existing,
      ...data,
      dateReception: data.dateReception
        ? new Date(data.dateReception)
        : existing.dateReception,
      dateTraitement:
        data.dateTraitement
          ? new Date(data.dateTraitement)
          : data.statut === 'Traité' && !existing.dateTraitement
            ? new Date()
            : existing.dateTraitement,
      noteSatisfaction:
        data.noteSatisfaction !== undefined && data.noteSatisfaction !== null && data.noteSatisfaction !== ''
          ? parseInt(data.noteSatisfaction, 10)
          : existing.noteSatisfaction,
    };

    const metrics = this.computeDelaiAndRespect(mergedData);

    const priorite = this.computePriorite({
      ...mergedData,
      ...metrics,
    });

    let updated: any;
    try {
      updated = await this.prisma.demande.update({
        where: { id },
        data: {
          ...data,
          dateReception: mergedData.dateReception,
          dateTraitement: mergedData.dateTraitement,
          noteSatisfaction: mergedData.noteSatisfaction,
          delaiTraitement: metrics.delaiTraitement,
          respectDelai: metrics.respectDelai,
          priorite,
        },
      });
    } catch (e) {
      console.error('[demandes.update] Prisma error:', e?.message, JSON.stringify(e?.meta));
      throw new InternalServerErrorException(`Erreur Prisma: ${e?.message}`);
    }

    if (data.statut && data.statut !== existing.statut) {
      await this.prisma.timeline.create({
        data: {
          demandeId: id,
          auteur: data.agentN1 || existing.agentN1 || 'Système',
          action: 'Statut modifié',
          canal: 'CRM',
          detail: `Statut changé : ${existing.statut} → ${data.statut}`,
        },
      });
    }

    if (metrics.respectDelai === 'NON' && existing.agentN2) {
      await this.prisma.timeline.create({
        data: {
          demandeId: id,
          auteur: 'Système',
          action: 'Escalade N2',
          canal: 'CRM',
          detail: `Demande hors SLA transférée à ${existing.agentN2}`,
        },
      });
    }

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.demande.delete({ where: { id } });
  }
}