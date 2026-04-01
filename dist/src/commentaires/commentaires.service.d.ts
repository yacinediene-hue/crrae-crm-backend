import { PrismaService } from '../prisma/prisma.service';
export declare class CommentairesService {
    private prisma;
    constructor(prisma: PrismaService);
    findByDemande(demandeId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        auteur: string;
        demandeId: string;
        contenu: string;
    }[]>;
    create(data: any): import(".prisma/client").Prisma.Prisma__CommentaireClient<{
        id: string;
        createdAt: Date;
        auteur: string;
        demandeId: string;
        contenu: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__CommentaireClient<{
        id: string;
        createdAt: Date;
        auteur: string;
        demandeId: string;
        contenu: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
