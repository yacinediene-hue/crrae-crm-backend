import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

const STATUTS_CLOS = ['Traité', 'Clôturé', 'Clôturée'];

// Fallback délais par service (pour demandes sans typeDemandeId)
const DELAIS_SERVICE: Record<string, number> = {
  DPM: 3, DPR: 5, DDSI: 6, PATRIMOINE: 7, DCR: 5, DFC: 5, DRUC: 5, REGISSEUR: 5, Autre: 5,
};
const DELAI_DEFAUT = 3;

const SEUIL_APPROCHE = 0.75; // alerte à 75% du délai écoulé
const SEUIL_INACTIVITE_JOURS = 2;

function getDateLimiteEffective(d: any, now: Date): { dateLimite: Date | null; delaiMax: number | null } {
  if (d.dateLimite) {
    return { dateLimite: new Date(d.dateLimite), delaiMax: d.typeDemande?.delaiMaxJours ?? null };
  }
  if (d.dateReception) {
    const delaiMax = DELAIS_SERVICE[d.service ?? ''] ?? DELAI_DEFAUT;
    const dl = new Date(d.dateReception);
    dl.setDate(dl.getDate() + delaiMax);
    return { dateLimite: dl, delaiMax };
  }
  return { dateLimite: null, delaiMax: null };
}

@Injectable()
export class AlertesService {
  private readonly logger = new Logger(AlertesService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  @Cron('0 8 * * *')
  async verifierSlaEtAlerter() {
    this.logger.log('[SLA] Vérification quotidienne déclenchée');
    const count = await this.envoyerAlertesSla();
    this.logger.log(`[SLA] ${count} alerte(s) envoyée(s)`);
  }

  async envoyerAlertesSla(): Promise<number> {
    const now = new Date();

    const demandes = await this.prisma.demande.findMany({
      where: {
        statut: { notIn: STATUTS_CLOS },
        dateReception: { not: null },
      },
      select: {
        id: true, numDemande: true, nomPrenom: true, objetDemande: true,
        statut: true, service: true, agentN1: true, agentN2: true,
        dateReception: true, respectDelai: true, priorite: true,
        dateLimite: true,
        typeDemande: { select: { delaiMaxJours: true } },
      },
    });

    const horsSla = demandes.filter(d => {
      const { dateLimite } = getDateLimiteEffective(d, now);
      return dateLimite != null && now > dateLimite;
    });

    if (horsSla.length === 0) return 0;

    const parAgent: Record<string, typeof horsSla> = {};
    for (const d of horsSla) {
      for (const agent of [d.agentN1, d.agentN2].filter(Boolean) as string[]) {
        if (!parAgent[agent]) parAgent[agent] = [];
        parAgent[agent].push(d);
      }
    }

    let envoyees = 0;
    for (const [agentNom, dossiers] of Object.entries(parAgent)) {
      const user = await this.prisma.user.findFirst({
        where: { name: { equals: agentNom, mode: 'insensitive' } },
        select: { email: true, name: true },
      });
      if (!user?.email) continue;

      await this.emailService.envoyerAlerteSla({
        toEmail: user.email,
        toNom: user.name,
        dossiers: dossiers.map(d => {
          const { dateLimite, delaiMax } = getDateLimiteEffective(d, now);
          const joursEcoules = d.dateReception
            ? Math.ceil((now.getTime() - new Date(d.dateReception).getTime()) / 86400000)
            : 0;
          return {
            numDemande: d.numDemande || d.id,
            nomPrenom: d.nomPrenom,
            objetDemande: d.objetDemande || '—',
            statut: d.statut,
            service: d.service || '—',
            dateReception: new Date(d.dateReception!).toLocaleDateString('fr-FR'),
            delaiMax: delaiMax ?? DELAI_DEFAUT,
            joursEcoules,
          };
        }),
        baseUrl: process.env.FRONTEND_URL || 'https://crm.relationclient-crrae.org',
      }).catch(e => this.logger.error('[SLA] email non envoyé à', agentNom, e?.message));

      envoyees++;
    }
    return envoyees;
  }

  @Cron('0 9 * * *')
  async verifierApprocheDelaiCron() {
    this.logger.log('[APPROCHE] Vérification approche délai déclenchée');
    const count = await this.verifierApprocheDelai();
    this.logger.log(`[APPROCHE] ${count} alerte(s) envoyée(s)`);
  }

  @Cron('0 14 * * *')
  async relancerAgentsCron() {
    this.logger.log('[RELANCE] Vérification relances déclenchée');
    const count = await this.relancerAgents();
    this.logger.log(`[RELANCE] ${count} relance(s) envoyée(s)`);
  }

  async verifierApprocheDelai(): Promise<number> {
    const now = new Date();

    const demandes = await this.prisma.demande.findMany({
      where: { statut: { notIn: STATUTS_CLOS }, dateReception: { not: null } },
      select: {
        id: true, numDemande: true, nomPrenom: true, objetDemande: true,
        statut: true, service: true, agentN1: true, agentN2: true, dateReception: true,
        dateLimite: true,
        typeDemande: { select: { delaiMaxJours: true } },
      },
    });

    const procheEcheance = demandes.filter(d => {
      const { dateLimite, delaiMax } = getDateLimiteEffective(d, now);
      if (!dateLimite || !delaiMax || delaiMax <= 0) return false;
      const joursEcoules = Math.ceil((now.getTime() - new Date(d.dateReception!).getTime()) / 86400000);
      const pct = joursEcoules / delaiMax;
      return pct >= SEUIL_APPROCHE && now < dateLimite;
    });

    if (procheEcheance.length === 0) return 0;

    const parAgent: Record<string, typeof procheEcheance> = {};
    for (const d of procheEcheance) {
      for (const agent of [d.agentN1, d.agentN2].filter(Boolean) as string[]) {
        if (!parAgent[agent]) parAgent[agent] = [];
        parAgent[agent].push(d);
      }
    }

    let envoyees = 0;
    for (const [agentNom, dossiers] of Object.entries(parAgent)) {
      const user = await this.prisma.user.findFirst({
        where: { name: { equals: agentNom, mode: 'insensitive' } },
        select: { email: true, name: true },
      });
      if (!user?.email) continue;

      await this.emailService.envoyerAlerteApprocheDelai({
        toEmail: user.email,
        toNom: user.name,
        dossiers: dossiers.map(d => {
          const { delaiMax } = getDateLimiteEffective(d, now);
          const dm = delaiMax ?? DELAI_DEFAUT;
          const joursEcoules = Math.ceil((now.getTime() - new Date(d.dateReception!).getTime()) / 86400000);
          return {
            numDemande: d.numDemande || d.id,
            nomPrenom: d.nomPrenom,
            objetDemande: d.objetDemande || '—',
            statut: d.statut,
            service: d.service || '—',
            dateReception: new Date(d.dateReception!).toLocaleDateString('fr-FR'),
            delaiMax: dm,
            joursEcoules,
            joursRestants: Math.max(0, dm - joursEcoules),
            pctUtilise: Math.min(99, Math.round(joursEcoules / dm * 100)),
          };
        }),
        baseUrl: process.env.FRONTEND_URL || 'https://crm.relationclient-crrae.org',
      }).catch(e => this.logger.error('[APPROCHE] email non envoyé à', agentNom, e?.message));

      envoyees++;
    }
    return envoyees;
  }

  async relancerAgents(): Promise<number> {
    const now = new Date();

    const demandes = await this.prisma.demande.findMany({
      where: { statut: { notIn: STATUTS_CLOS }, dateReception: { not: null } },
      select: {
        id: true, numDemande: true, nomPrenom: true, objetDemande: true,
        statut: true, service: true, agentN1: true, agentN2: true,
        dateReception: true, updatedAt: true,
      },
    });

    const aRelancer = demandes.filter(d => {
      const ref = d.updatedAt || d.dateReception;
      if (!ref) return false;
      const jours = Math.ceil((now.getTime() - new Date(ref).getTime()) / 86400000);
      return jours >= SEUIL_INACTIVITE_JOURS;
    });

    if (aRelancer.length === 0) return 0;

    const parAgent: Record<string, typeof aRelancer> = {};
    for (const d of aRelancer) {
      for (const agent of [d.agentN1, d.agentN2].filter(Boolean) as string[]) {
        if (!parAgent[agent]) parAgent[agent] = [];
        parAgent[agent].push(d);
      }
    }

    let envoyees = 0;
    for (const [agentNom, dossiers] of Object.entries(parAgent)) {
      const user = await this.prisma.user.findFirst({
        where: { name: { equals: agentNom, mode: 'insensitive' } },
        select: { email: true, name: true },
      });
      if (!user?.email) continue;

      await this.emailService.envoyerRelanceAgent({
        toEmail: user.email,
        toNom: user.name,
        dossiers: dossiers.map(d => {
          const ref = d.updatedAt || d.dateReception;
          const joursInactif = Math.ceil((now.getTime() - new Date(ref!).getTime()) / 86400000);
          return {
            numDemande: d.numDemande || d.id,
            nomPrenom: d.nomPrenom,
            objetDemande: d.objetDemande || '—',
            statut: d.statut,
            service: d.service || '—',
            dateReception: new Date(d.dateReception!).toLocaleDateString('fr-FR'),
            joursInactif,
          };
        }),
        baseUrl: process.env.FRONTEND_URL || 'https://crm.relationclient-crrae.org',
      }).catch(e => this.logger.error('[RELANCE] email non envoyé à', agentNom, e?.message));

      envoyees++;
    }
    return envoyees;
  }
}
