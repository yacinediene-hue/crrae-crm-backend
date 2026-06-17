import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

const STATUTS_CLOS = ['Traité', 'Clôturé'];
const DELAIS: Record<string, number> = {
  DPM: 3, DPR: 5, DDSI: 6, PATRIMOINE: 7, DCR: 5, DFC: 5, DRUC: 5, REGISSEUR: 5, Autre: 5,
};
const SEUIL_APPROCHE = 0.75; // alerte à 75% du délai écoulé
const SEUIL_INACTIVITE_JOURS = 2; // relance après 2j sans mise à jour

@Injectable()
export class AlertesService {
  private readonly logger = new Logger(AlertesService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /** Cron : tous les jours à 8h00 */
  @Cron('0 8 * * *')
  async verifierSlaEtAlerter() {
    this.logger.log('[SLA] Vérification quotidienne déclenchée');
    const count = await this.envoyerAlertesSla();
    this.logger.log(`[SLA] ${count} alerte(s) envoyée(s)`);
  }

  /** Déclenche manuellement (endpoint admin) */
  async envoyerAlertesSla(): Promise<number> {
    const now = new Date();

    // Récupère toutes les demandes actives avec dateReception
    const demandes = await this.prisma.demande.findMany({
      where: {
        statut:       { notIn: STATUTS_CLOS },
        dateReception: { not: null },
      },
      select: {
        id: true, numDemande: true, nomPrenom: true, objetDemande: true,
        statut: true, service: true, agentN1: true, agentN2: true,
        dateReception: true, respectDelai: true, priorite: true,
      },
    });

    // Identifie les demandes hors SLA
    const horsSla = demandes.filter(d => {
      const delaiMax = DELAIS[d.service ?? ''] ?? 3;
      const jours = Math.ceil((now.getTime() - new Date(d.dateReception!).getTime()) / (1000 * 60 * 60 * 24));
      return jours > delaiMax;
    });

    if (horsSla.length === 0) return 0;

    // Regroupe par agent
    const parAgent: Record<string, typeof horsSla> = {};
    for (const d of horsSla) {
      const agents = [d.agentN1, d.agentN2].filter(Boolean) as string[];
      for (const agent of agents) {
        if (!parAgent[agent]) parAgent[agent] = [];
        parAgent[agent].push(d);
      }
    }

    let envoyees = 0;

    for (const [agentNom, dossiers] of Object.entries(parAgent)) {
      // Cherche l'email de l'agent
      const user = await this.prisma.user.findFirst({
        where: { name: { equals: agentNom, mode: 'insensitive' } },
        select: { email: true, name: true },
      });

      if (!user?.email) continue;

      await this.emailService.envoyerAlerteSla({
        toEmail:  user.email,
        toNom:    user.name,
        dossiers: dossiers.map(d => ({
          numDemande:   d.numDemande || d.id,
          nomPrenom:    d.nomPrenom,
          objetDemande: d.objetDemande || '—',
          statut:       d.statut,
          service:      d.service || '—',
          dateReception: new Date(d.dateReception!).toLocaleDateString('fr-FR'),
          delaiMax:     DELAIS[d.service ?? ''] ?? 3,
          joursEcoules: Math.ceil((now.getTime() - new Date(d.dateReception!).getTime()) / (1000 * 60 * 60 * 24)),
        })),
        baseUrl: process.env.FRONTEND_URL || 'https://crm.relationclient-crrae.org',
      }).catch(e => this.logger.error('[SLA] email non envoyé à', agentNom, e?.message));

      envoyees++;
    }

    return envoyees;
  }

  /** Cron : tous les jours à 9h00 — demandes approchant le délai SLA */
  @Cron('0 9 * * *')
  async verifierApprocheDelaiCron() {
    this.logger.log('[APPROCHE] Vérification approche délai déclenchée');
    const count = await this.verifierApprocheDelai();
    this.logger.log(`[APPROCHE] ${count} alerte(s) envoyée(s)`);
  }

  /** Cron : tous les jours à 14h00 — relances agents inactifs */
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
      },
    });

    const procheEcheance = demandes.filter(d => {
      const delaiMax = DELAIS[d.service ?? ''] ?? 3;
      const jours = Math.ceil((now.getTime() - new Date(d.dateReception!).getTime()) / 86400000);
      const pct = jours / delaiMax;
      return pct >= SEUIL_APPROCHE && pct < 1;
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
          const delaiMax = DELAIS[d.service ?? ''] ?? 3;
          const joursEcoules = Math.ceil((now.getTime() - new Date(d.dateReception!).getTime()) / 86400000);
          return {
            numDemande: d.numDemande || d.id,
            nomPrenom: d.nomPrenom,
            objetDemande: d.objetDemande || '—',
            statut: d.statut,
            service: d.service || '—',
            dateReception: new Date(d.dateReception!).toLocaleDateString('fr-FR'),
            delaiMax,
            joursEcoules,
            joursRestants: Math.max(0, delaiMax - joursEcoules),
            pctUtilise: Math.min(99, Math.round(joursEcoules / delaiMax * 100)),
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
