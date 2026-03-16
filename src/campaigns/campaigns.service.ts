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
    return this.prisma.campaign.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.campaign.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.campaign.delete({ where: { id } });
  }
}
