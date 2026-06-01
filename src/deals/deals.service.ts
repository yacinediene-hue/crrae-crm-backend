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

  async create(data: any) {
    // Exclure les champs non scalaires (relations, champs inconnus)
    const allowed = ['nomPrenom','institution','pays','telephone','email','typeClient',
      'typeAdhesion','modeAdhesion','etapeAdhesion','documentsAttendus','documentsManquants',
      'agentResponsable','service','canalAcquisition','dateDemande','dateValidation',
      'dateActivation','commentaire','contactId'];
    const payload: any = {};
    for (const key of allowed) {
      if (data[key] !== undefined) {
        payload[key] = data[key] === '' ? null : data[key];
      }
    }
    payload.dateDemande    = payload.dateDemande    ? new Date(payload.dateDemande)    : null;
    payload.dateValidation = payload.dateValidation ? new Date(payload.dateValidation) : null;
    payload.dateActivation = payload.dateActivation ? new Date(payload.dateActivation) : null;
    payload.etapeAdhesion  = payload.etapeAdhesion  || 'Prospect identifié';
    payload.typeClient     = payload.typeClient      || 'Individuel';
    payload.nomPrenom      = payload.nomPrenom       || 'Non renseigné';
    payload.title          = payload.nomPrenom; // satisfait la contrainte NOT NULL héritée

    try {
      return await this.prisma.deal.create({ data: payload });
    } catch (e: any) {
      console.error('[deals.create] error:', e?.message, JSON.stringify(e?.meta));
      throw e;
    }
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
