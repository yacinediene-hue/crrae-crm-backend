import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  @Cron('30 2 * * *')
  async sauvegardeAuto() {
    this.logger.log('[BACKUP] Déclenchement sauvegarde automatique');
    try {
      await this.envoyerRapportSauvegarde();
      this.logger.log('[BACKUP] Rapport envoyé');
    } catch (e: any) {
      this.logger.error('[BACKUP] Erreur:', e?.message);
    }
  }

  async envoyerRapportSauvegarde() {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 86400000);
    const yesterday = new Date(now.getTime() - 86400000);

    const [
      totalDemandes, totalContacts, totalUsers, totalDeals,
      demandesHier, contactsSemaine, demandesOuvertes,
    ] = await Promise.all([
      this.prisma.demande.count(),
      this.prisma.contact.count(),
      this.prisma.user.count({ where: { active: true } }),
      this.prisma.deal.count(),
      this.prisma.demande.count({ where: { createdAt: { gte: yesterday } } }),
      this.prisma.contact.count({ where: { createdAt: { gte: lastWeek } } }),
      this.prisma.demande.count({ where: { statut: { notIn: ['Traité', 'Clôturé'] } } }),
    ]);

    const admins = await this.prisma.user.findMany({
      where: { role: 'admin', active: true, email: { not: null } },
      select: { email: true, name: true },
    });

    for (const admin of admins) {
      await this.email.envoyerRapportSauvegarde({
        toEmail: admin.email!,
        toNom: admin.name,
        genereLe: now.toLocaleString('fr-FR'),
        stats: { totalDemandes, totalContacts, totalUsers, totalDeals, demandesHier, contactsSemaine, demandesOuvertes },
      }).catch(e => this.logger.error('[BACKUP] Email non envoyé à', admin.email, e?.message));
    }

    return { admins: admins.length, stats: { totalDemandes, totalContacts, totalUsers, totalDeals } };
  }
}
