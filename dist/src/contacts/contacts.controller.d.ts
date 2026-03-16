import { ContactsService } from './contacts.service';
export declare class ContactsController {
    private service;
    constructor(service: ContactsService);
    findAll(query: any): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    findOne(id: string): Promise<{
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
    }>;
    create(body: any): import(".prisma/client").Prisma.Prisma__ContactClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, body: any): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
