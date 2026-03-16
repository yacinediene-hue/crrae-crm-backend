import { ActivitiesService } from './activities.service';
export declare class ActivitiesController {
    private service;
    constructor(service: ActivitiesService);
    findAll(query: any): any;
    findOne(id: string): Promise<any>;
    create(body: any): any;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
