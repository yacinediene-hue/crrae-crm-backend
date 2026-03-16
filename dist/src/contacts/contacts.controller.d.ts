import { ContactsService } from './contacts.service';
export declare class ContactsController {
    private service;
    constructor(service: ContactsService);
    findAll(query: any): any;
    findOne(id: string): Promise<any>;
    create(body: any): any;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
