import { CommentairesService } from './commentaires.service';
export declare class CommentairesController {
    private service;
    constructor(service: CommentairesService);
    findByDemande(demandeId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        auteur: string;
        demandeId: string;
        contenu: string;
    }[]>;
    create(body: any): import(".prisma/client").Prisma.Prisma__CommentaireClient<{
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
