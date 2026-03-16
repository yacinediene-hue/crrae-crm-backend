import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  findAll(query?: any) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.priority) where.priority = query.priority;
    if (query?.contactId) where.contactId = query.contactId;
    if (query?.assignedTo) where.assignedTo = query.assignedTo;
    return this.prisma.ticket.findMany({ where, include: { contact: true }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.ticket.findUnique({ where: { id }, include: { contact: true, surveys: true } });
    if (!item) throw new NotFoundException(`Ticket ${id} introuvable`);
    return item;
  }

  create(data: any) {
    return this.prisma.ticket.create({ data, include: { contact: true } });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.ticket.update({ where: { id }, data, include: { contact: true } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.ticket.delete({ where: { id } });
  }
}
