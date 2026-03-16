import { PrismaService } from '../prisma/prisma.service';
export declare class ContractsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: any): any;
    findOne(id: string): Promise<any>;
    create(data: any): any;
    update(id: string, data: any): Promise<any>;
    remove(id: string): Promise<any>;
}
