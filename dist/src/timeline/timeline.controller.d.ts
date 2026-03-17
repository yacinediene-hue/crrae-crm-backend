import { TimelineService } from './timeline.service';
export declare class TimelineController {
    private service;
    constructor(service: TimelineService);
    findByDemande(demandeId: string): any;
    create(body: any): any;
}
