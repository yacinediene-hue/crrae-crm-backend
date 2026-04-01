import { PrismaService } from '../prisma/prisma.service';
export declare class TimelineService {
    private prisma;
    constructor(prisma: PrismaService);
    findByDemande(demandeId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        canal: string | null;
        action: string;
        auteur: string;
        detail: string | null;
        demandeId: string;
    }[]>;
    create(data: any): import(".prisma/client").Prisma.Prisma__TimelineClient<{
        id: string;
        createdAt: Date;
        canal: string | null;
        action: string;
        auteur: string;
        detail: string | null;
        demandeId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
