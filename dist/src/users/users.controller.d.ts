import { UsersService } from './users.service';
export declare class UsersController {
    private service;
    constructor(service: UsersService);
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
    create(body: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        avatar: string;
        active: boolean;
        createdAt: Date;
    }>;
    update(id: string, body: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        avatar: string;
        active: boolean;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        avatar: string | null;
        active: boolean;
        passwordHash: string;
        createdAt: Date;
    }>;
}
