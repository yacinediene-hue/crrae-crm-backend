import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  log(params: {
    auteur: string;
    auteurId?: string;
    action: string;
    entite: string;
    entiteId?: string;
    detail?: string;
  }) {
    return this.prisma.auditLog.create({ data: params }).catch(e => {
      console.error('[AuditLog] Erreur écriture:', e?.message);
    });
  }
}
