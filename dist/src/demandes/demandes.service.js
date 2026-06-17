"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DemandesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandesService = exports.AGENTS_N2 = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const audit_service_1 = require("../audit/audit.service");
exports.AGENTS_N2 = ['KACOU Michèle', 'Fatty KOUAME', 'COULIBALY Ismail', 'Yacine DIENE'];
let DemandesService = DemandesService_1 = class DemandesService {
    constructor(prisma, emailService, audit) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.audit = audit;
    }
    computePriorite(data) {
        if (data.respectDelai === 'NON')
            return 'Urgent';
        const validValues = ['Faible', 'Moyen', 'Élevé', 'Urgent'];
        if (data.priorite && validValues.includes(data.priorite))
            return data.priorite;
        if (data.objetDemande === 'Réclamation')
            return 'Élevé';
        return 'Moyen';
    }
    computeDelaiAndRespect(data) {
        let delaiTraitement = null;
        let respectDelai = null;
        if (data.dateReception && data.dateTraitement) {
            const d1 = new Date(data.dateReception);
            const d2 = new Date(data.dateTraitement);
            delaiTraitement = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
            const delaisService = {
                DPM: 3,
                DPR: 5,
                DDSI: 6,
                PATRIMOINE: 7,
                DCR: 5,
                REGISSEUR: 5,
            };
            const delaiMax = delaisService[data.service] ?? 3;
            respectDelai = delaiTraitement <= delaiMax ? 'OUI' : 'NON';
        }
        return { delaiTraitement, respectDelai };
    }
    findAll(query) {
        const where = {};
        if (query?.statut)
            where.statut = query.statut;
        if (query?.service)
            where.service = query.service;
        if (query?.canal)
            where.canal = query.canal;
        if (query?.typeClient)
            where.typeClient = query.typeClient;
        return this.prisma.demande.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const item = await this.prisma.demande.findUnique({
            where: { id },
        });
        if (!item) {
            throw new common_1.NotFoundException(`Demande ${id} introuvable`);
        }
        return item;
    }
    sanitize(data) {
        const excluded = ['profilClient', 'niveauTraitement', 'dateEscalade', 'commentaireEscalade', 'skipEmail'];
        const nonNullable = ['typeClient', 'nomPrenom', 'statut'];
        const result = {};
        for (const key of Object.keys(data)) {
            if (excluded.includes(key))
                continue;
            if (key === 'canal') {
                const v = data[key];
                result[key] = v && DemandesService_1.VALID_CANAUX.includes(v) ? v : null;
                continue;
            }
            if (nonNullable.includes(key)) {
                if (key === 'nomPrenom')
                    result[key] = data[key] || 'Non renseigné';
                else if (key === 'typeClient')
                    result[key] = data[key] || 'Actif';
                else if (key === 'statut')
                    result[key] = data[key] || 'En cours';
                else
                    result[key] = data[key] || undefined;
            }
            else {
                result[key] = data[key] === '' ? null : data[key];
            }
        }
        return result;
    }
    async create(data) {
        data = this.sanitize(data);
        console.log('[create] nomPrenom:', data.nomPrenom, '| canal:', data.canal, '| statut:', data.statut);
        const last = await this.prisma.demande.findFirst({
            where: { numDemande: { startsWith: 'DEMS-' } },
            orderBy: { createdAt: 'desc' },
            select: { numDemande: true },
        });
        let nextNumber = 1;
        if (last?.numDemande) {
            const match = last.numDemande.match(/DEMS-(\d+)/);
            if (match)
                nextNumber = Number(match[1]) + 1;
        }
        const numDemande = `DEMS-${String(nextNumber).padStart(5, '0')}`;
        const dateReception = data.dateReception ? new Date(data.dateReception) : null;
        const dateTraitement = data.dateTraitement ? new Date(data.dateTraitement) : null;
        const noteSatisfaction = data.noteSatisfaction
            ? parseInt(data.noteSatisfaction, 10)
            : null;
        const computedData = { ...data, dateReception, dateTraitement };
        const metrics = this.computeDelaiAndRespect(computedData);
        const priorite = this.computePriorite({ ...computedData, ...metrics });
        let demande;
        try {
            demande = await this.prisma.demande.create({
                data: {
                    ...data,
                    numDemande,
                    dateReception,
                    dateTraitement,
                    noteSatisfaction,
                    delaiTraitement: metrics.delaiTraitement,
                    respectDelai: metrics.respectDelai,
                    priorite,
                },
            });
        }
        catch (e) {
            console.error('[create] Prisma error:', e?.message, JSON.stringify(e?.meta));
            throw new common_1.InternalServerErrorException(`Erreur création: ${e?.message}`);
        }
        try {
            await this.prisma.timeline.create({
                data: {
                    demandeId: demande.id,
                    auteur: data.agentN1 || 'Système',
                    action: 'Demande créée',
                    canal: data.canal || 'CRM',
                    detail: `Objet: ${data.objetDemande || 'Non précisé'} — Statut initial: ${data.statut || 'En cours'}`,
                },
            });
        }
        catch (e) {
            console.error('Erreur création timeline', e);
        }
        if (demande.email && !data.skipEmail) {
            this.emailService.envoyerAccuseReception(demande.email, demande.numDemande, demande.nomPrenom).catch(e => console.error('[email] Accusé de réception non envoyé:', e?.message));
        }
        return demande;
    }
    async update(id, data) {
        data = this.sanitize(data);
        const existing = await this.findOne(id);
        const resolvedDateTraitement = data.dateTraitement
            ? new Date(data.dateTraitement)
            : data.statut === 'Traité' && !existing.dateTraitement
                ? new Date()
                : existing.dateTraitement;
        const resolvedStatut = data.statut
            ?? (resolvedDateTraitement ? 'Traité' : 'En cours');
        const mergedData = {
            ...existing,
            ...data,
            statut: resolvedStatut,
            dateReception: data.dateReception
                ? new Date(data.dateReception)
                : existing.dateReception,
            dateTraitement: resolvedDateTraitement,
            noteSatisfaction: data.noteSatisfaction !== undefined && data.noteSatisfaction !== null && data.noteSatisfaction !== ''
                ? parseInt(data.noteSatisfaction, 10)
                : existing.noteSatisfaction,
        };
        const metrics = this.computeDelaiAndRespect(mergedData);
        const priorite = this.computePriorite({
            ...mergedData,
            ...metrics,
        });
        let updated;
        try {
            updated = await this.prisma.demande.update({
                where: { id },
                data: {
                    ...data,
                    statut: resolvedStatut,
                    dateReception: mergedData.dateReception,
                    dateTraitement: mergedData.dateTraitement,
                    noteSatisfaction: mergedData.noteSatisfaction,
                    delaiTraitement: metrics.delaiTraitement,
                    respectDelai: metrics.respectDelai,
                    priorite,
                },
            });
        }
        catch (e) {
            console.error('[demandes.update] Prisma error:', e?.message, JSON.stringify(e?.meta));
            throw new common_1.InternalServerErrorException(`Erreur Prisma: ${e?.message}`);
        }
        if (resolvedStatut && resolvedStatut !== existing.statut) {
            await this.prisma.timeline.create({
                data: {
                    demandeId: id,
                    auteur: data.agentN1 || existing.agentN1 || 'Système',
                    action: 'Statut modifié',
                    canal: 'CRM',
                    detail: `Statut changé : ${existing.statut} → ${resolvedStatut}`,
                },
            });
        }
        if (metrics.respectDelai === 'NON' && existing.agentN2) {
            await this.prisma.timeline.create({
                data: {
                    demandeId: id,
                    auteur: 'Système',
                    action: 'Escalade N2',
                    canal: 'CRM',
                    detail: `Demande hors SLA transférée à ${existing.agentN2}`,
                },
            });
        }
        return updated;
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.demande.delete({ where: { id } });
    }
    async sendSurvey(id, user) {
        console.log('[SURVEY] start', id);
        const demande = await this.prisma.demande.findUnique({ where: { id } });
        console.log('[SURVEY] demande found', {
            id: demande?.id,
            numDemande: demande?.numDemande,
            email: demande?.email,
            enqueteEnvoyee: demande?.enqueteEnvoyee,
        });
        if (!demande)
            throw new common_1.NotFoundException(`Demande ${id} introuvable`);
        if (!demande.email)
            throw new common_1.BadRequestException('Aucune adresse email sur cette demande');
        const surveyLink = `https://forms.office.com/r/Wy6ukuKUpF?r=${encodeURIComponent(demande.numDemande || demande.id)}`;
        console.log('[SURVEY] before email send', demande.email);
        await this.emailService.sendSurveyEmail(demande.email, demande.nomPrenom || 'Client', surveyLink, demande.numDemande);
        console.log('[SURVEY] email sent ok');
        console.log('[SURVEY] before update enqueteEnvoyee');
        const updated = await this.prisma.demande.update({
            where: { id },
            data: { enqueteEnvoyee: true, dateEnvoiEnquete: new Date() },
        });
        console.log('[SURVEY] update done');
        try {
            await this.prisma.timeline.create({
                data: {
                    demandeId: demande.id,
                    auteur: user?.name || 'Système',
                    action: 'Enquête envoyée',
                    canal: 'EMAIL',
                    detail: `Enquête de satisfaction envoyée à ${demande.email}`,
                },
            });
        }
        catch (e) {
            console.error('Erreur création timeline', e);
        }
        this.audit.log({
            auteur: user?.email || user?.name || 'Système',
            auteurId: user?.id,
            action: 'SEND_SURVEY',
            entite: 'Demande',
            entiteId: demande.id,
            detail: `Enquête envoyée à ${demande.email} pour ${demande.numDemande}`,
        });
        return updated;
    }
    async escalader(id, data, user) {
        const demande = await this.findOne(id);
        if (demande.niveauTraitement === 2) {
            throw new common_1.BadRequestException('Cette demande est déjà escaladée au niveau 2');
        }
        const updated = await this.prisma.demande.update({
            where: { id },
            data: {
                niveauTraitement: 2,
                statut: 'Escaladé',
                dateEscalade: new Date(),
                commentaireEscalade: data.motif || null,
                agentN2: data.agentN2 || demande.agentN2,
                service: data.service || demande.service,
            },
        });
        try {
            await this.prisma.timeline.create({
                data: {
                    demandeId: id,
                    auteur: user?.name || demande.agentN1 || 'Système',
                    action: 'Escalade N2',
                    canal: 'CRM',
                    detail: `Escaladée vers ${data.agentN2 || '—'} (${data.service || '—'})${data.motif ? ` — Motif : ${data.motif}` : ''}`,
                },
            });
        }
        catch (e) {
            console.error('[escalader] timeline error', e);
        }
        this.audit.log({
            auteur: user?.email || user?.name || 'Système',
            auteurId: user?.id,
            action: 'ESCALADE_N2',
            entite: 'Demande',
            entiteId: id,
            detail: `Escalade vers ${data.agentN2 || '—'} / ${data.service || '—'}`,
        });
        if (data.agentN2) {
            const agentN2User = await this.prisma.user.findFirst({
                where: { name: { equals: data.agentN2, mode: 'insensitive' } },
                select: { email: true, name: true },
            });
            if (agentN2User?.email) {
                const baseUrl = process.env.FRONTEND_URL || 'https://crm.relationclient-crrae.org';
                this.emailService.envoyerNotificationEscalade({
                    toEmail: agentN2User.email,
                    toNom: agentN2User.name,
                    numDemande: demande.numDemande || id,
                    nomClient: demande.nomPrenom,
                    service: data.service || demande.service || '',
                    motif: data.motif || '',
                    agentN1: demande.agentN1 || '',
                    lienCrm: `${baseUrl}/demandes`,
                }).catch(e => console.error('[escalade] email N2 non envoyé:', e?.message));
            }
        }
        return updated;
    }
    async prendreEnCharge(id, user) {
        const demande = await this.findOne(id);
        if (demande.niveauTraitement !== 2) {
            throw new common_1.BadRequestException('Cette demande n\'est pas au niveau N2');
        }
        const updated = await this.prisma.demande.update({
            where: { id },
            data: {
                statut: 'En cours N2',
                agentN2: user?.name || demande.agentN2,
            },
        });
        try {
            await this.prisma.timeline.create({
                data: {
                    demandeId: id,
                    auteur: user?.name || 'Système',
                    action: 'Prise en charge N2',
                    canal: 'CRM',
                    detail: `Prise en charge par ${user?.name || '—'} (Back Office)`,
                },
            });
        }
        catch (e) {
            console.error('[prendreEnCharge] timeline error', e);
        }
        this.audit.log({
            auteur: user?.email || user?.name || 'Système',
            auteurId: user?.id,
            action: 'PRISE_EN_CHARGE_N2',
            entite: 'Demande',
            entiteId: id,
            detail: `Prise en charge par ${user?.name || '—'}`,
        });
        return updated;
    }
    async renvoyerN1(id, data, user) {
        const demande = await this.findOne(id);
        if (demande.niveauTraitement !== 2) {
            throw new common_1.BadRequestException('Cette demande n\'est pas au niveau N2');
        }
        const updated = await this.prisma.demande.update({
            where: { id },
            data: {
                niveauTraitement: 1,
                statut: 'En cours',
                commentaireEscalade: null,
            },
        });
        try {
            await this.prisma.timeline.create({
                data: {
                    demandeId: id,
                    auteur: user?.name || 'Système',
                    action: 'Renvoi N1',
                    canal: 'CRM',
                    detail: `Renvoyée au Front Office${data.motif ? ` — Motif : ${data.motif}` : ''}`,
                },
            });
        }
        catch (e) {
            console.error('[renvoyerN1] timeline error', e);
        }
        this.audit.log({
            auteur: user?.email || user?.name || 'Système',
            auteurId: user?.id,
            action: 'RENVOI_N1',
            entite: 'Demande',
            entiteId: id,
            detail: `Renvoi N1 par ${user?.name || '—'}${data.motif ? ` — ${data.motif}` : ''}`,
        });
        return updated;
    }
};
exports.DemandesService = DemandesService;
DemandesService.VALID_CANAUX = ['EMAIL', 'TELEPHONE', 'WHATSAPP', 'SITE_WEB', 'GUICHET', 'LINKEDIN', 'FACEBOOK', 'AUTRE'];
exports.DemandesService = DemandesService = DemandesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        audit_service_1.AuditService])
], DemandesService);
//# sourceMappingURL=demandes.service.js.map