import { Injectable } from '@nestjs/common';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class EmailService {

  private getApi() {
    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
    return new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async envoyerAccuseReception(email: string, numDemande: string, nom: string) {
    await this.getApi().sendTransacEmail({
      sender: { email: process.env.EMAIL_FROM, name: 'CRRAE-UMOA' },
      to: [{ email }],
      subject: `Accusé de réception – ${numDemande}`,
      htmlContent: `
        <p>Bonjour ${nom},</p>
        <p>Votre demande a été enregistrée sous le numéro : <strong>${numDemande}</strong></p>
        <p>Elle est actuellement en cours de traitement par nos services.</p>
        <br/>
        <p>Service Client<br/>CRRAE-UMOA</p>
      `,
    });
  }

  async envoyerResetPassword(email: string, nom: string, lien: string) {
    await this.getApi().sendTransacEmail({
      sender: { email: process.env.EMAIL_FROM, name: 'CRRAE-UMOA' },
      to: [{ email }],
      subject: 'Réinitialisation de votre mot de passe',
      htmlContent: `
        <p>Bonjour ${nom},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p><a href="${lien}" style="background:#1e3a6d;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Réinitialiser mon mot de passe</a></p>
        <p style="color:#6b7280;font-size:14px;">Ce lien est valable 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        <br/>
        <p>Service Client<br/>CRRAE-UMOA</p>
      `,
    });
  }
}
