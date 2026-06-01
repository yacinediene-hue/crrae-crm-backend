import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

const STATUTS_CLOS = ['Traité', 'Clôturé'];
const DELAIS: Record<string, number> = {
  DPM: 3, DPR: 5, DSI: 6, PATRIMOINE: 7, DCR: 5, DFC: 5, DRUC: 5, REGISSEUR: 5, Autre: 5,
};

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
}
