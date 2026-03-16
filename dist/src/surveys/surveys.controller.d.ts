import { SurveysService } from './surveys.service';
export declare class SurveysController {
    private service;
    constructor(service: SurveysService);
    findAll(query: any): any;
    findOne(id: string): Promise<any>;
    create(body: any): any;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<any>;
}
