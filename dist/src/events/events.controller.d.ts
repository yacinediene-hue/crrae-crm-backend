import { EventsService } from './events.service';
export declare class EventsController {
    private service;
    constructor(service: EventsService);
    findAll(query: any): any;
    findOne(id: string): Promise<any>;
    create(body: any): any;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
