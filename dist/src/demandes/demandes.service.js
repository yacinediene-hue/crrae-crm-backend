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
let DemandesService = class DemandesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(query) {
        const where = {};
        if (query?.statut)
            where.statut = query.statut;
        if (query?.service)
            where.service = query.service;
        return this.prisma.demande.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    async findOne(id) {
        const item = await this.prisma.demande.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException(`Demande ${id} introuvable`);
        return item;
    }
    async create(data) {
        const count = await this.prisma.demande.count();
        const numDemande = `DEMS-${String(count + 1).padStart(5, '0')}`;
        let delaiTraitement;
        let respectDelai;
        if (data.dateReception && data.dateTraitement) {
            const d1 = new Date(data.dateReception);
            const d2 = new Date(data.dateTraitement);
            delaiTraitement = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
            const delaisService = { DPM: 3, DPR: 5, DSI: 6, PATRIMOINE: 7, DCR: 5, REGISSEUR: 5 };
            const delaiMax = delaisService[data.service] ?? 3;
            respectDelai = delaiTraitement <= delaiMax ? 'OUI' : 'NON';
        }
        return this.prisma.demande.create({
            data: {
                ...data,
                numDemande,
                delaiTraitement,
                respectDelai,
                dateReception: data.dateReception ? new Date(data.dateReception) : null,
                dateTraitement: data.dateTraitement ? new Date(data.dateTraitement) : null,
                noteSatisfaction: data.noteSatisfaction ? parseInt(data.noteSatisfaction) : null,
            },
        });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.demande.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.demande.delete({ where: { id } });
    }
};
exports.DemandesService = DemandesService;
exports.DemandesService = DemandesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DemandesService);
//# sourceMappingURL=demandes.service.js.map