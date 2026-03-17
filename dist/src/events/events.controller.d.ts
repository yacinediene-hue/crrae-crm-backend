import { EventsService } from './events.service';
export declare class EventsController {
    private service;
    constructor(service: EventsService);
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
        title: string;
        contactId: string;
        type: string;
        date: Date;
        note: string | null;
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
        title: string;
        contactId: string;
        type: string;
        date: Date;
        note: string | null;
        time: string | null;
        done: boolean;
    }>;
    create(body: any): import(".prisma/client").Prisma.Prisma__EventClient<{
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
        title: string;
        contactId: string;
        type: string;
        date: Date;
        note: string | null;
        time: string | null;
        done: boolean;
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
        title: string;
        contactId: string;
        type: string;
        date: Date;
        note: string | null;
        time: string | null;
        done: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        contactId: string;
        type: string;
        date: Date;
        note: string | null;
        time: string | null;
        done: boolean;
    }>;
}
