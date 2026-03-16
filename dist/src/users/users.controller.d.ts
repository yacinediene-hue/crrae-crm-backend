import { UsersService } from './users.service';
export declare class UsersController {
    private service;
    constructor(service: UsersService);
    findAll(query: any): any;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
