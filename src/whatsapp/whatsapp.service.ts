import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client: any;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
    });

    this.client.on('qr', (qr: string) => {
      console.log('=== SCANNEZ CE QR CODE AVEC WHATSAPP ===');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('✅ WhatsApp connecté !');
    });

    this.client.on('message', async (msg: any) => {
      if (msg.from === 'status@broadcast') return;
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
            canal: 'WHATSAPP',
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
            canal: 'WHATSAPP',
            detail: msg.body,
          }
        });

        console.log(`✅ Demande créée: ${numDemande} - ${nom}`);

        await this.client.sendMessage(msg.from,
          `Bonjour ${nom},\n\nNous accusons réception de votre demande enregistrée sous le numéro *${numDemande}*.\n\nVotre dossier est en cours de traitement. Nous reviendrons vers vous dès que possible.\n\nCordialement,\nService Client CRRAE-UMOA`
        );
      } catch (e) {
        console.error('Erreur traitement message:', e);
      }
    });

    this.client.initialize();
  }

  getStatus() {
    return { connected: this.client?.info ? true : false };
  }
}
