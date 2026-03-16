import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class WhatsappService implements OnModuleInit {
    private prisma;
    private client;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    getStatus(): {
        connected: boolean;
    };
}
