"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
let WhatsappService = class WhatsappService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
        });
        this.client.on('qr', (qr) => {
            console.log('=== SCANNEZ CE QR CODE AVEC WHATSAPP ===');
            qrcode.generate(qr, { small: true });
        });
        this.client.on('ready', () => {
            console.log('✅ WhatsApp connecté !');
        });
        this.client.on('message', async (msg) => {
            if (msg.from === 'status@broadcast')
                return;
            try {
                const contact = await msg.getContact();
                const nom = contact.pushname || contact.number || 'Inconnu';
                const telephone = msg.from.replace('@c.us', '');
                const count = await this.prisma.demande.count();
                const numDemande = `DEMS-${String(count + 1).padStart(5, '0')}`;
                const demande = await this.prisma.demande.create({
                    data: {
                        numDemande,
                        nomPrenom: nom,
                        telephone,
                        canal: 'WhatsApp',
                        objetDemande: 'Information',
                        commentaire: msg.body,
                        statut: 'En cours',
                        dateReception: new Date(),
                        typeClient: 'Actif',
                    }
                });
                await this.prisma.timeline.create({
                    data: {
                        demandeId: demande.id,
                        auteur: 'WhatsApp',
                        action: 'Message entrant',
                        canal: 'WhatsApp',
                        detail: msg.body,
                    }
                });
                console.log(`✅ Demande créée: ${numDemande} - ${nom}`);
                await this.client.sendMessage(msg.from, `Bonjour ${nom},\n\nNous accusons réception de votre demande enregistrée sous le numéro *${numDemande}*.\n\nVotre dossier est en cours de traitement. Nous reviendrons vers vous dès que possible.\n\nCordialement,\nService Client CRRAE-UMOA`);
            }
            catch (e) {
                console.error('Erreur traitement message:', e);
            }
        });
        this.client.initialize();
    }
    getStatus() {
        return { connected: this.client?.info ? true : false };
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map