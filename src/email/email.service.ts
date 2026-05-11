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

  async sendSurveyEmail(to: string, nom: string, surveyLink: string, numDemande: string) {
    console.log('[BREVO] sendSurveyEmail called', { to, nom, numDemande });
    try {
      await this.getApi().sendTransacEmail({
        sender: { email: process.env.EMAIL_FROM, name: 'CRRAE-UMOA' },
        to: [{ email: to, name: nom }],
        subject: `Votre avis nous intéresse – Demande ${numDemande}`,
        htmlContent: `
          <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.5;">
            <h2 style="color:#1e3a6d;">CRRAE-UMOA</h2>
            <p>Bonjour ${nom},</p>
            <p>Dans le cadre du suivi de votre demande <strong>${numDemande}</strong>, nous vous invitons à partager votre niveau de satisfaction.</p>
            <p><a href="${surveyLink}" style="display:inline-block;padding:12px 18px;background:#1e3a6d;color:#fff;text-decoration:none;border-radius:6px;">Répondre à l'enquête</a></p>
            <p>Nous vous remercions pour votre retour.</p>
            <br/><p>Service Client<br/>CRRAE-UMOA</p>
          </div>
        `,
      });
      console.log('[BREVO] sendTransacEmail success');
    } catch (e) {
      console.error('[BREVO] sendTransacEmail error', e);
      throw e;
    }
  }

  async envoyerNotificationEscalade(params: {
    toEmail: string;
    toNom: string;
    numDemande: string;
    nomClient: string;
    service: string;
    motif: string;
    agentN1: string;
    lienCrm: string;
  }) {
    const { toEmail, toNom, numDemande, nomClient, service, motif, agentN1, lienCrm } = params;
    try {
      await this.getApi().sendTransacEmail({
        sender: { email: process.env.EMAIL_FROM, name: 'CRRAE-UMOA CRM' },
        to: [{ email: toEmail, name: toNom }],
        subject: `[CRM] Escalade N2 — Demande ${numDemande}`,
        htmlContent: `
          <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;max-width:560px">
            <div style="background:#6b46c1;padding:1.25rem 1.5rem;border-radius:8px 8px 0 0">
              <h2 style="color:white;margin:0;font-size:1.1rem">🔺 Nouvelle demande escaladée — Back Office</h2>
            </div>
            <div style="background:#faf5ff;border:1px solid #e9d8fd;border-top:none;padding:1.25rem 1.5rem;border-radius:0 0 8px 8px">
              <p>Bonjour <strong>${toNom}</strong>,</p>
              <p>Une demande vient d'être escaladée au Back Office et vous est assignée.</p>
              <table style="width:100%;border-collapse:collapse;margin:1rem 0;font-size:0.9rem">
                <tr><td style="padding:0.4rem 0;color:#718096;width:140px">N° demande</td><td style="padding:0.4rem 0;font-weight:600">${numDemande}</td></tr>
                <tr><td style="padding:0.4rem 0;color:#718096">Client</td><td style="padding:0.4rem 0">${nomClient}</td></tr>
                <tr><td style="padding:0.4rem 0;color:#718096">Service</td><td style="padding:0.4rem 0">${service || '—'}</td></tr>
                <tr><td style="padding:0.4rem 0;color:#718096">Agent N1</td><td style="padding:0.4rem 0">${agentN1 || '—'}</td></tr>
                ${motif ? `<tr><td style="padding:0.4rem 0;color:#718096">Motif escalade</td><td style="padding:0.4rem 0;font-style:italic">${motif}</td></tr>` : ''}
              </table>
              <p>
                <a href="${lienCrm}" style="display:inline-block;padding:0.6rem 1.25rem;background:#6b46c1;color:white;text-decoration:none;border-radius:6px;font-weight:600;font-size:0.9rem">
                  Voir la demande dans le CRM →
                </a>
              </p>
              <p style="color:#718096;font-size:0.8rem;margin-top:1rem">CRRAE-UMOA — Service Client</p>
            </div>
          </div>
        `,
      });
      console.log('[BREVO] notification escalade envoyée à', toEmail);
    } catch (e) {
      console.error('[BREVO] erreur notification escalade', e);
    }
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
