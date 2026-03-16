import { TicketsService } from './tickets.service';
export declare class TicketsController {
    private service;
    constructor(service: TicketsService);
    findAll(query: any): any;
    findOne(id: string): Promise<any>;
    create(body: any): any;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
