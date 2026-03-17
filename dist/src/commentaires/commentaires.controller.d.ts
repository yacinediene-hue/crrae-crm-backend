import { CommentairesService } from './commentaires.service';
export declare class CommentairesController {
    private service;
    constructor(service: CommentairesService);
    findByDemande(demandeId: string): any;
    create(body: any): any;
    remove(id: string): any;
}
