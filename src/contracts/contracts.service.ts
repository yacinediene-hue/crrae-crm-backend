import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  findAll(query?: any) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.contactId) where.contactId = query.contactId;
    return this.prisma.contract.findMany({ where, include: { contact: true }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.contract.findUnique({ where: { id }, include: { contact: true } });
    if (!item) throw new NotFoundException(`Contract ${id} introuvable`);
    return item;
  }

  create(data: any) {
    return this.prisma.contract.create({ data, include: { contact: true } });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.contract.update({ where: { id }, data, include: { contact: true } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contract.delete({ where: { id } });
  }
}
