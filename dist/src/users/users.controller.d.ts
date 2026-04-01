import { UsersService } from './users.service';
import { AuditService } from '../audit/audit.service';
export declare class UsersController {
    private service;
    private audit;
    constructor(service: UsersService, audit: AuditService);
    findAll(query: any): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        email: string;
        name: string;
        role: string;
        avatar: string;
        active: boolean;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        avatar: string;
        active: boolean;
        createdAt: Date;
    }>;
    create(body: any, req: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        avatar: string;
        active: boolean;
        createdAt: Date;
    }>;
    update(id: string, body: any, req: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        avatar: string;
        active: boolean;
        createdAt: Date;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        avatar: string | null;
        active: boolean;
        passwordHash: string;
        resetToken: string | null;
        resetTokenExpires: Date | null;
        createdAt: Date;
    }>;
}
