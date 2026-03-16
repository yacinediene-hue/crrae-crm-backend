import { PrismaService } from '../prisma/prisma.service';
export declare class ContractsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: any): import(".prisma/client").Prisma.PrismaPromise<({
        contact: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            phone: string | null;
            company: string | null;
            status: string;
            value: number;
            lastContact: Date | null;
            tags: string[];
            notes: string | null;
            assignedTo: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        value: number;
        title: string;
        contactId: string;
        startDate: Date | null;
        endDate: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        contact: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            phone: string | null;
            company: string | null;
            status: string;
            value: number;
            lastContact: Date | null;
            tags: string[];
            notes: string | null;
            assignedTo: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        value: number;
        title: string;
        contactId: string;
        startDate: Date | null;
        endDate: Date | null;
    }>;
    create(data: any): import(".prisma/client").Prisma.Prisma__ContractClient<{
        contact: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            phone: string | null;
            company: string | null;
            status: string;
            value: number;
            lastContact: Date | null;
            tags: string[];
            notes: string | null;
            assignedTo: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        value: number;
        title: string;
        contactId: string;
        startDate: Date | null;
        endDate: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, data: any): Promise<{
        contact: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            phone: string | null;
            company: string | null;
            status: string;
            value: number;
            lastContact: Date | null;
            tags: string[];
            notes: string | null;
            assignedTo: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        value: number;
        title: string;
        contactId: string;
        startDate: Date | null;
        endDate: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        value: number;
        title: string;
        contactId: string;
        startDate: Date | null;
        endDate: Date | null;
    }>;
}
