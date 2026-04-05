import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {

  private transporter = nodemailer.createTransport({
    host: 'ssl0.ovh.net',
    port: 587,
    secure: false,
    auth: {
      user: 'support@relationclient-crrae.org',
      pass: process.env.MAIL_PASSWORD,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    tls: {
      rejectUnauthorized: false,
    },
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