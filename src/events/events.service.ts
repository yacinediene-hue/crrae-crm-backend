import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  findAll(query?: any) {
    const where: any = {};
    if (query?.contactId) where.contactId = query.contactId;
    if (query?.type) where.type = query.type;
    if (query?.done !== undefined) where.done = query.done === 'true';
    return this.prisma.event.findMany({ where, include: { contact: true }, orderBy: { date: 'asc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.event.findUnique({ where: { id }, include: { contact: true } });
    if (!item) throw new NotFoundException(`Event ${id} introuvable`);
    return item;
  }

  create(data: any) {
    return this.prisma.event.create({ data, include: { contact: true } });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.event.update({ where: { id }, data, include: { contact: true } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.event.delete({ where: { id } });
  }
}
