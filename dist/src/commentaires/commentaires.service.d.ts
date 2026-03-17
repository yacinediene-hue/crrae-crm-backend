import { PrismaService } from '../prisma/prisma.service';
export declare class CommentairesService {
    private prisma;
    constructor(prisma: PrismaService);
    findByDemande(demandeId: string): any;
    create(data: any): any;
    remove(id: string): any;
}
