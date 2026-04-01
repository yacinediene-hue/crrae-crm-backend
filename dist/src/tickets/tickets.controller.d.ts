import { TicketsService } from './tickets.service';
export declare class TicketsController {
    private service;
    constructor(service: TicketsService);
    findAll(query: any): import(".prisma/client").Prisma.PrismaPromise<({
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
        status: string;
        assignedTo: string | null;
        contactId: string;
        type: string;
        subject: string;
        priority: string;
        closedAt: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        surveys: {
            id: string;
            contactId: string;
            csat: number | null;
            nps: number | null;
            comment: string | null;
            sentAt: Date;
            respondedAt: Date | null;
            ticketId: string;
        }[];
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
        status: string;
        assignedTo: string | null;
        contactId: string;
        type: string;
        subject: string;
        priority: string;
        closedAt: Date | null;
    }>;
    create(body: any): import(".prisma/client").Prisma.Prisma__TicketClient<{
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
        status: string;
        assignedTo: string | null;
        contactId: string;
        type: string;
        subject: string;
        priority: string;
        closedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, body: any): Promise<{
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
        status: string;
        assignedTo: string | null;
        contactId: string;
        type: string;
        subject: string;
        priority: string;
        closedAt: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        assignedTo: string | null;
        contactId: string;
        type: string;
        subject: string;
        priority: string;
        closedAt: Date | null;
    }>;
}
