import { WhatsappService } from './whatsapp.service';
export declare class WhatsappController {
    private service;
    constructor(service: WhatsappService);
    getStatus(): {
        connected: boolean;
    };
}
