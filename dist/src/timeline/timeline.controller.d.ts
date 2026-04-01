import { TimelineService } from './timeline.service';
export declare class TimelineController {
    private service;
    constructor(service: TimelineService);
    findByDemande(demandeId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        canal: string | null;
        action: string;
        auteur: string;
        detail: string | null;
        demandeId: string;
    }[]>;
    create(body: any): import(".prisma/client").Prisma.Prisma__TimelineClient<{
        id: string;
        createdAt: Date;
        canal: string | null;
        action: string;
        auteur: string;
        detail: string | null;
        demandeId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
