import { DemandesService } from './demandes.service';
export declare class DemandesController {
    private service;
    constructor(service: DemandesService);
    findAll(query: any): any;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
