import { PrismaService } from '../prisma/prisma.service';
export declare class CampaignsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: any): import(".prisma/client").Prisma.PrismaPromise<{
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
    create(data: any): import(".prisma/client").Prisma.Prisma__CampaignClient<{
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
    update(id: string, data: any): Promise<{
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
