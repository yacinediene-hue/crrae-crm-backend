import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SurveysService {
  constructor(private prisma: PrismaService) {}

  findAll(query?: any) {
    const where: any = {};
    if (query?.contactId) where.contactId = query.contactId;
    if (query?.ticketId) where.ticketId = query.ticketId;
    return this.prisma.survey.findMany({ where, include: { contact: true, ticket: true }, orderBy: { sentAt: 'desc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.survey.findUnique({ where: { id }, include: { contact: true, ticket: true } });
    if (!item) throw new NotFoundException(`Survey ${id} introuvable`);
    return item;
  }

  create(data: any) {
    return this.prisma.survey.create({ data, include: { contact: true, ticket: true } });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.survey.update({ where: { id }, data, include: { contact: true, ticket: true } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.survey.delete({ where: { id } });
  }
}
