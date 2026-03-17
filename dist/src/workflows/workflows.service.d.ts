import { PrismaService } from '../prisma/prisma.service';
export declare class WorkflowsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: any): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        active: boolean;
        createdAt: Date;
        trigger: string;
        action: string;
        runs: number;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        active: boolean;
        createdAt: Date;
        trigger: string;
        action: string;
        runs: number;
    }>;
    create(data: any): import(".prisma/client").Prisma.Prisma__WorkflowClient<{
        id: string;
        name: string;
        active: boolean;
        createdAt: Date;
        trigger: string;
        action: string;
        runs: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, data: any): Promise<{
        id: string;
        name: string;
        active: boolean;
        createdAt: Date;
        trigger: string;
        action: string;
        runs: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        active: boolean;
        createdAt: Date;
        trigger: string;
        action: string;
        runs: number;
    }>;
}
