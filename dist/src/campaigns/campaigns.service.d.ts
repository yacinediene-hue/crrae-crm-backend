import { PrismaService } from '../prisma/prisma.service';
export declare class CampaignsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: any): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        profilClient: string | null;
        status: string | null;
        subject: string | null;
        content: string | null;
        canal: string | null;
        statut: string;
        tag: string | null;
        dateEnvoi: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        profilClient: string | null;
        status: string | null;
        subject: string | null;
        content: string | null;
        canal: string | null;
        statut: string;
        tag: string | null;
        dateEnvoi: Date | null;
    }>;
    create(data: any): import(".prisma/client").Prisma.Prisma__CampaignClient<{
        id: string;
        name: string;
        createdAt: Date;
        profilClient: string | null;
        status: string | null;
        subject: string | null;
        content: string | null;
        canal: string | null;
        statut: string;
        tag: string | null;
        dateEnvoi: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        profilClient: string | null;
        status: string | null;
        subject: string | null;
        content: string | null;
        canal: string | null;
        statut: string;
        tag: string | null;
        dateEnvoi: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        profilClient: string | null;
        status: string | null;
        subject: string | null;
        content: string | null;
        canal: string | null;
        statut: string;
        tag: string | null;
        dateEnvoi: Date | null;
    }>;
    getTargets(campaignId: string): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        phone: string | null;
        company: string | null;
        profilClient: string | null;
        status: string;
        value: number;
        lastContact: Date | null;
        tags: string[];
        notes: string | null;
        assignedTo: string | null;
    }[]>;
}
