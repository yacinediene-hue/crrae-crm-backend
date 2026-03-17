import { SurveysService } from './surveys.service';
export declare class SurveysController {
    private service;
    constructor(service: SurveysService);
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
        ticket: {
            id: string;
            createdAt: Date;
            status: string;
            assignedTo: string | null;
            contactId: string;
            type: string;
            subject: string;
            priority: string;
            closedAt: Date | null;
        };
    } & {
        id: string;
        contactId: string;
        csat: number | null;
        nps: number | null;
        comment: string | null;
        sentAt: Date;
        respondedAt: Date | null;
        ticketId: string;
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
        ticket: {
            id: string;
            createdAt: Date;
            status: string;
            assignedTo: string | null;
            contactId: string;
            type: string;
            subject: string;
            priority: string;
            closedAt: Date | null;
        };
    } & {
        id: string;
        contactId: string;
        csat: number | null;
        nps: number | null;
        comment: string | null;
        sentAt: Date;
        respondedAt: Date | null;
        ticketId: string;
    }>;
    create(body: any): import(".prisma/client").Prisma.Prisma__SurveyClient<{
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
        ticket: {
            id: string;
            createdAt: Date;
            status: string;
            assignedTo: string | null;
            contactId: string;
            type: string;
            subject: string;
            priority: string;
            closedAt: Date | null;
        };
    } & {
        id: string;
        contactId: string;
        csat: number | null;
        nps: number | null;
        comment: string | null;
        sentAt: Date;
        respondedAt: Date | null;
        ticketId: string;
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
        ticket: {
            id: string;
            createdAt: Date;
            status: string;
            assignedTo: string | null;
            contactId: string;
            type: string;
            subject: string;
            priority: string;
            closedAt: Date | null;
        };
    } & {
        id: string;
        contactId: string;
        csat: number | null;
        nps: number | null;
        comment: string | null;
        sentAt: Date;
        respondedAt: Date | null;
        ticketId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        contactId: string;
        csat: number | null;
        nps: number | null;
        comment: string | null;
        sentAt: Date;
        respondedAt: Date | null;
        ticketId: string;
    }>;
}
