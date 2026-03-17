import { PrismaService } from '../prisma/prisma.service';
export declare class EnquetesController {
    private prisma;
    constructor(prisma: PrismaService);
    getEnquete(token: string): Promise<any>;
    submitEnquete(token: string, body: any): Promise<any>;
}
