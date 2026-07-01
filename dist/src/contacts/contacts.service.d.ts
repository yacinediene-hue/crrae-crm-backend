import { PrismaService } from '../prisma/prisma.service';
export declare class ContactsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: any): Promise<unknown>;
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
            contactId: string | null;
            title: string;
            nomPrenom: string | null;
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
            updatedAt: Date | null;
        }[];
        events: {
            id: string;
            createdAt: Date;
            contactId: string;
            title: string;
            type: string;
            date: Date;
            note: string | null;
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
        email: string | null;
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
        email: string | null;
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
    syncFromDemandes(): Promise<{
        crees: number;
        mises_a_jour: number;
        ignores: number;
        total: number;
        premiereErreur: string[];
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        email: string | null;
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
        email: string | null;
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
    searchKamagate(): Promise<{
        users: {
            id: string;
            email: string;
            name: string;
        }[];
        contacts: {
            id: string;
            name: string;
        }[];
        demandes: {
            id: string;
            nomPrenom: string;
            numDemande: string;
            agentN1: string;
            agentN2: string;
        }[];
        deals: {
            id: string;
            nomPrenom: string;
            agentResponsable: string;
        }[];
    }>;
    private uniformiserKamagate;
    migrerNomKamagate(): Promise<{
        cible: string;
        rapport: any[];
        total: number;
    }>;
}
