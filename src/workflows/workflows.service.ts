import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  findAll(query?: any) {
    const where: any = {};
    if (query?.active !== undefined) where.active = query.active === 'true';
    return this.prisma.workflow.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.workflow.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Workflow ${id} introuvable`);
    return item;
  }

  create(data: any) {
    return this.prisma.workflow.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.workflow.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.workflow.delete({ where: { id } });
  }
}
