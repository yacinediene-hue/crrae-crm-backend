import { PrismaService } from '../prisma/prisma.service';
export declare class ContactsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: any): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    findOne(id: string): Promise<{
        activities: {
            id: string;
            createdAt: Date;
            contactId: string;
            type: string;
            date: Date;
            note: string | null;
        }[];
        contracts: {
            id: string;
            createdAt: Date;
            status: string;
            value: number;
            contactId: string;
            title: string;
            startDate: Date | null;
            endDate: Date | null;
        }[];
        deals: {
            id: string;
            email: string | null;
            createdAt: Date;
            nomPrenom: string;
            institution: string | null;
            pays: string | null;
            telephone: string | null;
            typeClient: string | null;
            typeAdhesion: string | null;
            modeAdhesion: string | null;
            etapeAdhesion: string | null;
            documentsAttendus: string | null;
            documentsManquants: string | null;
            agentResponsable: string | null;
            service: string | null;
            canalAcquisition: string | null;
            dateDemande: Date | null;
            dateValidation: Date | null;
            dateActivation: Date | null;
            commentaire: string | null;
            updatedAt: Date;
            contactId: string | null;
        }[];
        events: {
            id: string;
            createdAt: Date;
            contactId: string;
            type: string;
            date: Date;
            note: string | null;
            title: string;
            time: string | null;
            done: boolean;
        }[];
        tickets: ({
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
        })[];
    } & {
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
    }>;
    create(data: any): import(".prisma/client").Prisma.Prisma__ContactClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    importContacts(contacts: any[]): Promise<{
        total: number;
        imported: number;
        duplicates: number;
        skipped: number;
        errors: number;
        duplicateRows: any[];
        skippedRows: any[];
        errorRows: any[];
        contacts: any[];
    }>;
    update(id: string, data: any): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
