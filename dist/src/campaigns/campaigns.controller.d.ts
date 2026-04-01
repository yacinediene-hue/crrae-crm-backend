import { CampaignsService } from './campaigns.service';
export declare class CampaignsController {
    private service;
    constructor(service: CampaignsService);
    findAll(query: any): import(".prisma/client").Prisma.PrismaPromise<{
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
    getTargets(id: string): Promise<{
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
    create(body: any): import(".prisma/client").Prisma.Prisma__CampaignClient<{
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
    update(id: string, body: any): Promise<{
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
}
