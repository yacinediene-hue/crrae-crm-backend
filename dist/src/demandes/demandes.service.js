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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
let DemandesService = class DemandesService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
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
                DSI: 6,
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
    async create(data) {
        const count = await this.prisma.demande.count();
        const numDemande = `DEMS-${String(count + 1).padStart(5, '0')}`;
        const dateReception = data.dateReception ? new Date(data.dateReception) : null;
        const dateTraitement = data.dateTraitement ? new Date(data.dateTraitement) : null;
        const noteSatisfaction = data.noteSatisfaction
            ? parseInt(data.noteSatisfaction, 10)
            : null;
        const computedData = {
            ...data,
            dateReception,
            dateTraitement,
        };
        const metrics = this.computeDelaiAndRespect(computedData);
        const priorite = this.computePriorite({
            ...computedData,
            ...metrics,
        });
        const demande = await this.prisma.demande.create({
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
        await this.prisma.timeline.create({
            data: {
                demandeId: demande.id,
                auteur: data.agentN1 || 'Système',
                action: 'Demande créée',
                canal: data.canal || 'CRM',
                detail: `Objet: ${data.objetDemande || 'Non précisé'} — Statut initial: ${data.statut || 'En cours'}`,
            },
        });
        if (demande.email) {
            this.emailService.envoyerAccuseReception(demande.email, demande.numDemande, demande.nomPrenom).catch(e => console.error('[email] Accusé de réception non envoyé:', e?.message));
        }
        return demande;
    }
    async update(id, data) {
        const existing = await this.findOne(id);
        const mergedData = {
            ...existing,
            ...data,
            dateReception: data.dateReception
                ? new Date(data.dateReception)
                : existing.dateReception,
            dateTraitement: data.dateTraitement
                ? new Date(data.dateTraitement)
                : data.statut === 'Traité' && !existing.dateTraitement
                    ? new Date()
                    : existing.dateTraitement,
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
        if (data.statut && data.statut !== existing.statut) {
            await this.prisma.timeline.create({
                data: {
                    demandeId: id,
                    auteur: data.agentN1 || existing.agentN1 || 'Système',
                    action: 'Statut modifié',
                    canal: 'CRM',
                    detail: `Statut changé : ${existing.statut} → ${data.statut}`,
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
};
exports.DemandesService = DemandesService;
exports.DemandesService = DemandesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], DemandesService);
//# sourceMappingURL=demandes.service.js.map