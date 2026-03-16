import { DealsService } from './deals.service';
export declare class DealsController {
    private service;
    constructor(service: DealsService);
    findAll(query: any): any;
    findOne(id: string): Promise<any>;
    create(body: any): any;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
