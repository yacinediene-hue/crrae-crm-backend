import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  findAll(query?: any) {
    const where: any = {};
    if (query?.contactId) where.contactId = query.contactId;
    if (query?.type) where.type = query.type;
    return this.prisma.activity.findMany({ where, include: { contact: true }, orderBy: { date: 'desc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.activity.findUnique({ where: { id }, include: { contact: true } });
    if (!item) throw new NotFoundException(`Activity ${id} introuvable`);
    return item;
  }

  create(data: any) {
    return this.prisma.activity.create({ data, include: { contact: true } });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.activity.update({ where: { id }, data, include: { contact: true } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.activity.delete({ where: { id } });
  }
}
