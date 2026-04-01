import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  findAll(query?: any) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.type) where.type = query.type;
    return this.prisma.campaign.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.campaign.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Campaign ${id} introuvable`);
    return item;
  }

  create(data: any) {
    const payload = {
      ...data,
      dateEnvoi: data.dateEnvoi ? new Date(data.dateEnvoi) : null,
    };
    return this.prisma.campaign.create({ data: payload });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const payload = {
      ...data,
      dateEnvoi: data.dateEnvoi ? new Date(data.dateEnvoi) : null,
    };
    return this.prisma.campaign.update({ where: { id }, data: payload });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.campaign.delete({ where: { id } });
  }

  async getTargets(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) return [];

    const where: any = {};

    if (campaign.profilClient) {
      where.profilClient = campaign.profilClient;
    }

    if (campaign.status) {
      where.status = campaign.status;
    }

    if (campaign.tag) {
      where.tags = { has: campaign.tag };
    }

    return this.prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}
