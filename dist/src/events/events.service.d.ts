import { PrismaService } from '../prisma/prisma.service';
export declare class EventsService {
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
            profilClient: string | null;
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
        title: string;
        time: string | null;
        done: boolean;
    })[]>;
    findOne(id: string): Promise<{
        contact: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        contactId: string;
        type: string;
        date: Date;
        note: string | null;
        title: string;
        time: string | null;
        done: boolean;
    }>;
    create(data: any): import(".prisma/client").Prisma.Prisma__EventClient<{
        contact: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        contactId: string;
        type: string;
        date: Date;
        note: string | null;
        title: string;
        time: string | null;
        done: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, data: any): Promise<{
        contact: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        contactId: string;
        type: string;
        date: Date;
        note: string | null;
        title: string;
        time: string | null;
        done: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        contactId: string;
        type: string;
        date: Date;
        note: string | null;
        title: string;
        time: string | null;
        done: boolean;
    }>;
}
