import { PrismaService } from '../prisma/prisma.service';
export declare class EnquetesController {
    private prisma;
    constructor(prisma: PrismaService);
    getEnquete(token: string): Promise<{
        id: string;
        nomPrenom: string;
        statut: string;
        numDemande: string;
        objetDemande: string;
        noteSatisfaction: number;
    } | {
        error: string;
    }>;
    submitEnquete(token: string, body: any): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        nomPrenom: string;
        pays: string | null;
        telephone: string | null;
        typeClient: string;
        service: string | null;
        commentaire: string | null;
        updatedAt: Date;
        canal: string | null;
        statut: string;
        numDemande: string | null;
        matricule: string | null;
        adherent: string | null;
        heureAppel: string | null;
        objetDemande: string | null;
        agentN1: string | null;
        agentN2: string | null;
        dateReception: Date | null;
        dateTraitement: Date | null;
        priorite: string | null;
        actionMenee: string | null;
        delaiTraitement: number | null;
        respectDelai: string | null;
        canalCommunication: string | null;
        enqueteEnvoyee: boolean;
        noteSatisfaction: number | null;
    } | {
        error: string;
    }>;
}
