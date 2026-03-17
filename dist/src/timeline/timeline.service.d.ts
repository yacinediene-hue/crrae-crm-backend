import { PrismaService } from '../prisma/prisma.service';
export declare class TimelineService {
    private prisma;
    constructor(prisma: PrismaService);
    findByDemande(demandeId: string): any;
    create(data: any): any;
}
