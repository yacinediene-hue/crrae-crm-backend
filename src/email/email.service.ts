import { Injectable } from '@nestjs/common';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class EmailService {

  private isDisabled(): boolean {
    return process.env.DISABLE_EMAILS === 'true';
  }

  private isAccuseDisabled(): boolean {
    return this.isDisabled() || process.env.DISABLE_ACCUSE_RECEPTION === 'true';
  }

  private isEnqueteDisabled(): boolean {
    return this.isDisabled() || process.env.DISABLE_ENQUETE === 'true';
  }

  private getApi() {
    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
    return new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async envoyerAccuseReception(email: string, numDemande: string, nom: string) {
    if (this.isAccuseDisabled()) { console.log('[EMAIL] accusé de réception suspendu'); return; }
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
    if (this.isEnqueteDisabled()) { console.log('[EMAIL] enquête suspendue'); return; }
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
    if (this.isDisabled()) { console.log('[EMAIL] désactivé — escalade non notifiée'); return; }
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

  async envoyerAlerteSla(params: {
    toEmail: string; toNom: string;
    dossiers: { numDemande: string; nomPrenom: string; objetDemande: string; statut: string; service: string; dateReception: string; delaiMax: number; joursEcoules: number }[];
    baseUrl: string;
  }) {
    const { toEmail, toNom, dossiers, baseUrl } = params;
    if (this.isDisabled()) { console.log('[EMAIL] désactivé — alerte SLA non envoyée'); return; }
    const lignes = dossiers.map(d => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:0.5rem 0.75rem;font-weight:600;color:#2b6cb0;">${d.numDemande}</td>
        <td style="padding:0.5rem 0.75rem;">${d.nomPrenom}</td>
        <td style="padding:0.5rem 0.75rem;font-size:0.85rem;">${d.objetDemande}</td>
        <td style="padding:0.5rem 0.75rem;">${d.service}</td>
        <td style="padding:0.5rem 0.75rem;">${d.dateReception}</td>
        <td style="padding:0.5rem 0.75rem;color:#c53030;font-weight:700;">${d.joursEcoules}j <span style="color:#718096;font-weight:400;">(max ${d.delaiMax}j)</span></td>
        <td style="padding:0.5rem 0.75rem;">
          <span style="background:#fffbeb;color:#b7791f;padding:2px 8px;border-radius:20px;font-size:0.8rem;">${d.statut}</span>
        </td>
      </tr>`).join('');
    try {
      await this.getApi().sendTransacEmail({
        sender: { email: process.env.EMAIL_FROM, name: 'CRRAE-UMOA CRM' },
        to: [{ email: toEmail, name: toNom }],
        subject: `⚠️ ${dossiers.length} demande(s) hors SLA — Action requise`,
        htmlContent: `
          <div style="font-family:Arial,sans-serif;color:#1f2937;max-width:700px;">
            <div style="background:#c53030;padding:1rem 1.5rem;border-radius:8px 8px 0 0;">
              <h2 style="color:white;margin:0;font-size:1.1rem;">⚠️ Alerte SLA — Demandes hors délai</h2>
            </div>
            <div style="border:1px solid #e2e8f0;border-top:none;padding:1.25rem 1.5rem;border-radius:0 0 8px 8px;background:#fff5f5;">
              <p>Bonjour <strong>${toNom}</strong>,</p>
              <p>Les demandes suivantes dépassent le délai de traitement et nécessitent une action immédiate :</p>
              <table style="width:100%;border-collapse:collapse;font-size:0.88rem;background:white;border-radius:8px;overflow:hidden;margin:1rem 0;">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">N°</th>
                    <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">Client</th>
                    <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">Objet</th>
                    <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">Service</th>
                    <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">Réception</th>
                    <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">Délai</th>
                    <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">Statut</th>
                  </tr>
                </thead>
                <tbody>${lignes}</tbody>
              </table>
              <p style="text-align:center;margin-top:1rem;">
                <a href="${baseUrl}/demandes?filtre=horsSla" style="display:inline-block;padding:0.7rem 1.5rem;background:#c53030;color:white;text-decoration:none;border-radius:6px;font-weight:600;">
                  Traiter maintenant →
                </a>
              </p>
              <p style="color:#718096;font-size:0.8rem;margin-top:1rem;">CRRAE-UMOA — CRM Service Client · Alerte automatique</p>
            </div>
          </div>`,
      });
    } catch (e: any) { console.error('[BREVO] alerte SLA error', e?.message); }
  }

  async envoyerAlerteApprocheDelai(params: {
    toEmail: string; toNom: string;
    dossiers: { numDemande: string; nomPrenom: string; objetDemande: string; statut: string; service: string; dateReception: string; delaiMax: number; joursEcoules: number; joursRestants: number; pctUtilise: number }[];
    baseUrl: string;
  }) {
    const { toEmail, toNom, dossiers, baseUrl } = params;
    if (this.isDisabled()) { console.log('[EMAIL] désactivé — approche délai non envoyée'); return; }
    const lignes = dossiers.map(d => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:0.5rem 0.75rem;font-weight:600;color:#2b6cb0;">${d.numDemande}</td>
        <td style="padding:0.5rem 0.75rem;">${d.nomPrenom}</td>
        <td style="padding:0.5rem 0.75rem;font-size:0.85rem;">${d.objetDemande}</td>
        <td style="padding:0.5rem 0.75rem;">${d.service}</td>
        <td style="padding:0.5rem 0.75rem;">${d.dateReception}</td>
        <td style="padding:0.5rem 0.75rem;color:#b7791f;font-weight:700;">${d.joursRestants}j restant${d.joursRestants > 1 ? 's' : ''} / ${d.delaiMax}j</td>
        <td style="padding:0.5rem 0.75rem;">
          <div style="background:#e2e8f0;border-radius:99px;height:8px;width:80px;overflow:hidden;">
            <div style="width:${d.pctUtilise}%;height:100%;background:${d.pctUtilise >= 90 ? '#c53030' : '#b7791f'};border-radius:99px;"></div>
          </div>
          <span style="font-size:0.75rem;color:#718096;">${d.pctUtilise}%</span>
        </td>
      </tr>`).join('');
    try {
      await this.getApi().sendTransacEmail({
        sender: { email: process.env.EMAIL_FROM, name: 'CRRAE-UMOA CRM' },
        to: [{ email: toEmail, name: toNom }],
        subject: `🟡 ${dossiers.length} demande(s) approchant le délai SLA — Action requise`,
        htmlContent: `
          <div style="font-family:Arial,sans-serif;color:#1f2937;max-width:700px;">
            <div style="background:#b7791f;padding:1rem 1.5rem;border-radius:8px 8px 0 0;">
              <h2 style="color:white;margin:0;font-size:1.1rem;">🟡 Alerte délai — Demandes à traiter rapidement</h2>
            </div>
            <div style="border:1px solid #e2e8f0;border-top:none;padding:1.25rem 1.5rem;border-radius:0 0 8px 8px;background:#fffbeb;">
              <p>Bonjour <strong>${toNom}</strong>,</p>
              <p>Les demandes suivantes approchent de leur délai SLA. Merci de les prendre en charge rapidement :</p>
              <table style="width:100%;border-collapse:collapse;font-size:0.88rem;background:white;border-radius:8px;overflow:hidden;margin:1rem 0;">
                <thead><tr style="background:#f8fafc;">
                  <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">N°</th>
                  <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">Client</th>
                  <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">Objet</th>
                  <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">Service</th>
                  <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">Réception</th>
                  <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">Délai restant</th>
                  <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">SLA utilisé</th>
                </tr></thead>
                <tbody>${lignes}</tbody>
              </table>
              <p style="text-align:center;margin-top:1rem;">
                <a href="${baseUrl}/demandes" style="display:inline-block;padding:0.7rem 1.5rem;background:#b7791f;color:white;text-decoration:none;border-radius:6px;font-weight:600;">Accéder aux demandes →</a>
              </p>
              <p style="color:#718096;font-size:0.8rem;margin-top:1rem;">CRRAE-UMOA — CRM Service Client · Alerte automatique</p>
            </div>
          </div>`,
      });
    } catch (e: any) { console.error('[BREVO] approche délai error', e?.message); }
  }

  async envoyerRelanceAgent(params: {
    toEmail: string; toNom: string;
    dossiers: { numDemande: string; nomPrenom: string; objetDemande: string; statut: string; service: string; dateReception: string; joursInactif: number }[];
    baseUrl: string;
  }) {
    const { toEmail, toNom, dossiers, baseUrl } = params;
    if (this.isDisabled()) { console.log('[EMAIL] désactivé — relance non envoyée'); return; }
    const lignes = dossiers.map(d => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:0.5rem 0.75rem;font-weight:600;color:#2b6cb0;">${d.numDemande}</td>
        <td style="padding:0.5rem 0.75rem;">${d.nomPrenom}</td>
        <td style="padding:0.5rem 0.75rem;font-size:0.85rem;">${d.objetDemande}</td>
        <td style="padding:0.5rem 0.75rem;">${d.service}</td>
        <td style="padding:0.5rem 0.75rem;">${d.dateReception}</td>
        <td style="padding:0.5rem 0.75rem;"><span style="background:#ebf8ff;color:#2b6cb0;padding:2px 8px;border-radius:20px;font-size:0.8rem;">${d.statut}</span></td>
        <td style="padding:0.5rem 0.75rem;color:#6b46c1;font-weight:700;">${d.joursInactif}j sans mise à jour</td>
      </tr>`).join('');
    try {
      await this.getApi().sendTransacEmail({
        sender: { email: process.env.EMAIL_FROM, name: 'CRRAE-UMOA CRM' },
        to: [{ email: toEmail, name: toNom }],
        subject: `🔔 Relance — ${dossiers.length} demande(s) en attente de traitement`,
        htmlContent: `
          <div style="font-family:Arial,sans-serif;color:#1f2937;max-width:700px;">
            <div style="background:#2b6cb0;padding:1rem 1.5rem;border-radius:8px 8px 0 0;">
              <h2 style="color:white;margin:0;font-size:1.1rem;">🔔 Relance — Demandes en attente de votre action</h2>
            </div>
            <div style="border:1px solid #e2e8f0;border-top:none;padding:1.25rem 1.5rem;border-radius:0 0 8px 8px;background:#ebf8ff;">
              <p>Bonjour <strong>${toNom}</strong>,</p>
              <p>Les demandes suivantes n'ont pas été mises à jour depuis plus de 2 jours et nécessitent votre intervention :</p>
              <table style="width:100%;border-collapse:collapse;font-size:0.88rem;background:white;border-radius:8px;overflow:hidden;margin:1rem 0;">
                <thead><tr style="background:#f8fafc;">
                  <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">N°</th>
                  <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">Client</th>
                  <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">Objet</th>
                  <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">Service</th>
                  <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">Réception</th>
                  <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">Statut</th>
                  <th style="padding:0.5rem 0.75rem;text-align:left;color:#718096;font-size:0.78rem;text-transform:uppercase;">Inactivité</th>
                </tr></thead>
                <tbody>${lignes}</tbody>
              </table>
              <p style="text-align:center;margin-top:1rem;">
                <a href="${baseUrl}/demandes" style="display:inline-block;padding:0.7rem 1.5rem;background:#2b6cb0;color:white;text-decoration:none;border-radius:6px;font-weight:600;">Accéder aux demandes →</a>
              </p>
              <p style="color:#718096;font-size:0.8rem;margin-top:1rem;">CRRAE-UMOA — CRM Service Client · Relance automatique</p>
            </div>
          </div>`,
      });
    } catch (e: any) { console.error('[BREVO] relance agent error', e?.message); }
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
        <br/><p>Service Client<br/>CRRAE-UMOA</p>
      `,
    });
  }

  async envoyerOtp(toEmail: string, toNom: string, code: string) {
    console.log(`[OTP] Code 2FA pour ${toNom} <${toEmail}> : ${code}`);
    if (this.isDisabled()) { console.log('[EMAIL] OTP suspendu — voir le code ci-dessus dans les logs'); return; }
    try {
      await this.getApi().sendTransacEmail({
        sender: { email: process.env.EMAIL_FROM, name: 'CRRAE-UMOA CRM' },
        to: [{ email: toEmail, name: toNom }],
        subject: '🔐 Code de vérification — Connexion administrateur',
        htmlContent: `
          <div style="font-family:Arial,sans-serif;color:#1f2937;max-width:480px;margin:0 auto;">
            <div style="background:#1a365d;padding:1.25rem 1.5rem;border-radius:8px 8px 0 0;text-align:center;">
              <h2 style="color:white;margin:0;font-size:1.1rem;">🔐 Vérification en deux étapes</h2>
            </div>
            <div style="border:1px solid #e2e8f0;border-top:none;padding:2rem 1.5rem;border-radius:0 0 8px 8px;background:#f8fafc;text-align:center;">
              <p style="margin:0 0 1.5rem;">Bonjour <strong>${toNom}</strong>,</p>
              <p style="margin:0 0 1rem;color:#4a5568;">Voici votre code de connexion :</p>
              <div style="background:white;border:2px solid #2b6cb0;border-radius:12px;padding:1.25rem 2rem;display:inline-block;margin:0 0 1.5rem;">
                <span style="font-size:2.2rem;font-weight:800;letter-spacing:0.35em;color:#1a365d;">${code}</span>
              </div>
              <p style="color:#718096;font-size:0.85rem;margin:0 0 0.5rem;">Ce code est valable <strong>10 minutes</strong>.</p>
              <p style="color:#c53030;font-size:0.82rem;">Si vous n'êtes pas à l'origine de cette connexion, changez immédiatement votre mot de passe.</p>
            </div>
            <p style="color:#a0aec0;font-size:0.78rem;text-align:center;margin-top:1rem;">CRRAE-UMOA — CRM Service Client</p>
          </div>`,
      });
    } catch (e: any) { console.error('[BREVO] OTP email error', e?.message); }
  }

  async envoyerRapportSauvegarde(params: {
    toEmail: string; toNom: string; genereLe: string;
    stats: { totalDemandes: number; totalContacts: number; totalUsers: number; totalDeals: number; demandesHier: number; contactsSemaine: number; demandesOuvertes: number };
  }) {
    const { toEmail, toNom, genereLe, stats: s } = params;
    if (this.isDisabled()) { console.log('[EMAIL] Rapport sauvegarde suspendu'); return; }
    await this.getApi().sendTransacEmail({
      sender: { email: process.env.EMAIL_FROM, name: 'CRRAE-UMOA CRM' },
      to: [{ email: toEmail, name: toNom }],
      subject: `📦 Rapport de sauvegarde automatique — ${new Date().toLocaleDateString('fr-FR')}`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;color:#1f2937;max-width:560px;margin:0 auto;">
          <div style="background:#276749;padding:1rem 1.5rem;border-radius:8px 8px 0 0;">
            <h2 style="color:white;margin:0;font-size:1.1rem;">📦 Rapport de sauvegarde automatique</h2>
          </div>
          <div style="border:1px solid #e2e8f0;border-top:none;padding:1.5rem;border-radius:0 0 8px 8px;background:#f0fff4;">
            <p>Bonjour <strong>${toNom}</strong>,</p>
            <p>Voici l'état de la base de données CRRAE-UMOA CRM au <strong>${genereLe}</strong> :</p>
            <table style="width:100%;border-collapse:collapse;font-size:0.9rem;background:white;border-radius:8px;overflow:hidden;margin:1rem 0;">
              <tr style="background:#f0fff4;"><td style="padding:0.6rem 1rem;color:#718096;">Demandes totales</td><td style="padding:0.6rem 1rem;font-weight:700;text-align:right;">${s.totalDemandes}</td></tr>
              <tr><td style="padding:0.6rem 1rem;color:#718096;">Demandes ouvertes</td><td style="padding:0.6rem 1rem;font-weight:700;color:#b7791f;text-align:right;">${s.demandesOuvertes}</td></tr>
              <tr style="background:#f0fff4;"><td style="padding:0.6rem 1rem;color:#718096;">Nouvelles demandes (24h)</td><td style="padding:0.6rem 1rem;font-weight:700;color:#2b6cb0;text-align:right;">${s.demandesHier}</td></tr>
              <tr><td style="padding:0.6rem 1rem;color:#718096;">Contacts totaux</td><td style="padding:0.6rem 1rem;font-weight:700;text-align:right;">${s.totalContacts}</td></tr>
              <tr style="background:#f0fff4;"><td style="padding:0.6rem 1rem;color:#718096;">Nouveaux contacts (7j)</td><td style="padding:0.6rem 1rem;font-weight:700;color:#2b6cb0;text-align:right;">${s.contactsSemaine}</td></tr>
              <tr><td style="padding:0.6rem 1rem;color:#718096;">Adhésions (deals)</td><td style="padding:0.6rem 1rem;font-weight:700;text-align:right;">${s.totalDeals}</td></tr>
              <tr style="background:#f0fff4;"><td style="padding:0.6rem 1rem;color:#718096;">Utilisateurs actifs</td><td style="padding:0.6rem 1rem;font-weight:700;text-align:right;">${s.totalUsers}</td></tr>
            </table>
            <p style="color:#276749;font-size:0.85rem;">✅ La base de données Railway assure une sauvegarde continue. Ce rapport confirme l'état des données.</p>
            <p style="color:#718096;font-size:0.8rem;margin-top:1rem;">CRRAE-UMOA — CRM Service Client · Rapport automatique nocturne</p>
          </div>
        </div>`,
    });
  }
}
