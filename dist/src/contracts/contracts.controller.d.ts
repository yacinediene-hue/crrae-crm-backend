import { ContractsService } from './contracts.service';
export declare class ContractsController {
    private service;
    constructor(service: ContractsService);
    findAll(query: any): any;
    findOne(id: string): Promise<any>;
    create(body: any): any;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
