import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll(query?: any) {
    const where: any = {};
    if (query?.role) where.role = query.role;
    if (query?.active !== undefined) where.active = query.active === 'true';
    return this.prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, avatar: true, active: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, avatar: true, active: true, createdAt: true },
    });
    if (!item) throw new NotFoundException(`User ${id} introuvable`);
    return item;
  }

  async create(data: any) {
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }
    return this.prisma.user.create({
      data,
      select: { id: true, name: true, email: true, role: true, avatar: true, active: true, createdAt: true },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, avatar: true, active: true, createdAt: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}
