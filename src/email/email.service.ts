import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
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
}