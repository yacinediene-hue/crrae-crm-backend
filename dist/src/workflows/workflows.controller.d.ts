import { WorkflowsService } from './workflows.service';
export declare class WorkflowsController {
    private service;
    constructor(service: WorkflowsService);
    findAll(query: any): any;
    findOne(id: string): Promise<any>;
    create(body: any): any;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
