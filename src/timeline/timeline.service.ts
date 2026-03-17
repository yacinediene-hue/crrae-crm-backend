import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  findByDemande(demandeId: string) {
    return this.prisma.timeline.findMany({
      where: { demandeId },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(data: any) {
    return this.prisma.timeline.create({ data });
  }
}
