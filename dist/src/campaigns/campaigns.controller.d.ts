import { CampaignsService } from './campaigns.service';
export declare class CampaignsController {
    private service;
    constructor(service: CampaignsService);
    findAll(query: any): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        status: string;
        type: string;
        subject: string | null;
        sentAt: Date | null;
        segment: string | null;
        recipients: number;
        opens: number;
        clicks: number;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        status: string;
        type: string;
        subject: string | null;
        sentAt: Date | null;
        segment: string | null;
        recipients: number;
        opens: number;
        clicks: number;
    }>;
    create(body: any): import(".prisma/client").Prisma.Prisma__CampaignClient<{
        id: string;
        name: string;
        createdAt: Date;
        status: string;
        type: string;
        subject: string | null;
        sentAt: Date | null;
        segment: string | null;
        recipients: number;
        opens: number;
        clicks: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, body: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        status: string;
        type: string;
        subject: string | null;
        sentAt: Date | null;
        segment: string | null;
        recipients: number;
        opens: number;
        clicks: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        status: string;
        type: string;
        subject: string | null;
        sentAt: Date | null;
        segment: string | null;
        recipients: number;
        opens: number;
        clicks: number;
    }>;
}
