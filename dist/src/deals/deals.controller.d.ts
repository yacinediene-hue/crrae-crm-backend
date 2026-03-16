import { DealsService } from './deals.service';
export declare class DealsController {
    private service;
    constructor(service: DealsService);
    findAll(query: any): import(".prisma/client").Prisma.PrismaPromise<({
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
        value: number;
        notes: string | null;
        title: string;
        stage: string;
        probability: number;
        dueDate: Date | null;
        contactId: string;
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
        value: number;
        notes: string | null;
        title: string;
        stage: string;
        probability: number;
        dueDate: Date | null;
        contactId: string;
    }>;
    create(body: any): import(".prisma/client").Prisma.Prisma__DealClient<{
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
        value: number;
        notes: string | null;
        title: string;
        stage: string;
        probability: number;
        dueDate: Date | null;
        contactId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, body: any): Promise<{
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
        value: number;
        notes: string | null;
        title: string;
        stage: string;
        probability: number;
        dueDate: Date | null;
        contactId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        value: number;
        notes: string | null;
        title: string;
        stage: string;
        probability: number;
        dueDate: Date | null;
        contactId: string;
    }>;
}
