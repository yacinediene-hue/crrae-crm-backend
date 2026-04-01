import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  findAll(query?: any) {
    const where: any = {};

    if (query?.typeClient) where.typeClient = query.typeClient;
    if (query?.typeAdhesion) where.typeAdhesion = query.typeAdhesion;
    if (query?.etapeAdhesion) where.etapeAdhesion = query.etapeAdhesion;
    if (query?.service) where.service = query.service;
    if (query?.agentResponsable) where.agentResponsable = query.agentResponsable;
    if (query?.contactId) where.contactId = query.contactId;

    return this.prisma.deal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
    });

    if (!deal) {
      throw new NotFoundException(`Deal ${id} introuvable`);
    }

    return deal;
  }

  create(data: any) {
    const payload = {
      ...data,
      dateDemande: data.dateDemande ? new Date(data.dateDemande) : null,
      dateValidation: data.dateValidation ? new Date(data.dateValidation) : null,
      dateActivation: data.dateActivation ? new Date(data.dateActivation) : null,
      etapeAdhesion: data.etapeAdhesion || 'Prospect identifié',
      typeClient: data.typeClient || 'Individuel',
    };

    return this.prisma.deal.create({
      data: payload,
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);

    const payload = {
      ...data,
      dateDemande: data.dateDemande ? new Date(data.dateDemande) : null,
      dateValidation: data.dateValidation ? new Date(data.dateValidation) : null,
      dateActivation: data.dateActivation ? new Date(data.dateActivation) : null,
    };

    return this.prisma.deal.update({
      where: { id },
      data: payload,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.deal.delete({ where: { id } });
  }
}
