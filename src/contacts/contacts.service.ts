import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  findAll(query?: any) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.assignedTo) where.assignedTo = query.assignedTo;
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException(`Contact ${id} introuvable`);
    return contact;
  }

  create(data: any) {
    return this.prisma.contact.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.contact.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contact.delete({ where: { id } });
  }
}
