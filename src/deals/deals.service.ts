import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  findAll(query?: any) {
    const where: any = {};
    if (query?.stage) where.stage = query.stage;
    if (query?.contactId) where.contactId = query.contactId;
    return this.prisma.deal.findMany({ where, include: { contact: true }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const deal = await this.prisma.deal.findUnique({ where: { id }, include: { contact: true } });
    if (!deal) throw new NotFoundException(`Deal ${id} introuvable`);
    return deal;
  }

  create(data: any) {
    return this.prisma.deal.create({ data, include: { contact: true } });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.deal.update({ where: { id }, data, include: { contact: true } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.deal.delete({ where: { id } });
  }
}
