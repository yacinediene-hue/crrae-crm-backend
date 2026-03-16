import { CampaignsService } from './campaigns.service';
export declare class CampaignsController {
    private service;
    constructor(service: CampaignsService);
    findAll(query: any): any;
    findOne(id: string): Promise<any>;
    create(body: any): any;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
