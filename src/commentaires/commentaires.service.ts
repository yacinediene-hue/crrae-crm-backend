import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentairesService {
  constructor(private prisma: PrismaService) {}

  findByDemande(demandeId: string) {
    return this.prisma.commentaire.findMany({
      where: { demandeId },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(data: any) {
    return this.prisma.commentaire.create({ data });
  }

  remove(id: string) {
    return this.prisma.commentaire.delete({ where: { id } });
  }
}
