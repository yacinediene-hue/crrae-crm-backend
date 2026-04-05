import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {

  private transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  async envoyerAccuseReception(email: string, numDemande: string, nom: string) {

    const message = {
      from: `"Service Client CRRAE-UMOA" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Accusé de réception – ${numDemande}`,
      text: `
Bonjour ${nom},

Votre demande a été enregistrée sous le numéro :

${numDemande}

Elle est actuellement en cours de traitement par nos services.

Service Client
CRRAE-UMOA
      `,
    };

    await this.transporter.sendMail(message);
  }

  async envoyerResetPassword(email: string, nom: string, lien: string) {
    await this.transporter.verify();
    console.log('SMTP OK');
    await this.transporter.sendMail({
      from: `"Service Client CRRAE-UMOA" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      text: `
Bonjour ${nom},

Vous avez demandé la réinitialisation de votre mot de passe.

Cliquez sur le lien ci-dessous (valable 1 heure) :

${lien}

Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.

Service Client
CRRAE-UMOA
      `,
    });
  }
}