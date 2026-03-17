import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: any): import(".prisma/client").Prisma.PrismaPromise<{
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
    create(data: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        avatar: string;
        active: boolean;
        createdAt: Date;
    }>;
    update(id: string, data: any): Promise<{
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
