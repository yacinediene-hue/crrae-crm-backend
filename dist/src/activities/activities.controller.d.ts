import { ActivitiesService } from './activities.service';
export declare class ActivitiesController {
    private service;
    constructor(service: ActivitiesService);
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
        contactId: string;
        type: string;
        date: Date;
        note: string | null;
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
        contactId: string;
        type: string;
        date: Date;
        note: string | null;
    }>;
    create(body: any): import(".prisma/client").Prisma.Prisma__ActivityClient<{
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
        contactId: string;
        type: string;
        date: Date;
        note: string | null;
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
        contactId: string;
        type: string;
        date: Date;
        note: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        contactId: string;
        type: string;
        date: Date;
        note: string | null;
    }>;
}
