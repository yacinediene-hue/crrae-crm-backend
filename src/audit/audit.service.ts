import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditParams {
  auteur: string;
  auteurId?: string;
  role?: string;
  action: string;
  entite: string;
  entiteId?: string;
  detail?: string;
  ip?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  log(params: AuditParams) {
    return this.prisma.auditLog.create({ data: params }).catch(e => {
      console.error('[AuditLog] Erreur écriture:', e?.message);
    });
  }

  async getLogs(filters: {
    auteur?: string;
    action?: string;
    entite?: string;
    depuis?: string;
    limit?: number;
  }) {
    return this.prisma.auditLog.findMany({
      where: {
        auteur:   filters.auteur  ? { contains: filters.auteur,  mode: 'insensitive' } : undefined,
        action:   filters.action  ? { contains: filters.action }                       : undefined,
        entite:   filters.entite  ? { equals:   filters.entite }                       : undefined,
        createdAt: filters.depuis ? { gte: new Date(filters.depuis) }                  : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit ?? 500,
    });
  }

  async getStats() {
    const [total, connexions, actions] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.count({ where: { entite: 'Auth' } }),
      this.prisma.auditLog.count({ where: { entite: { not: 'Auth' } } }),
    ]);
    return { total, connexions, actions };
  }
}
