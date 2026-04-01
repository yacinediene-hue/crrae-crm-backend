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
exports.DealsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DealsService = class DealsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(query) {
        const where = {};
        if (query?.typeClient)
            where.typeClient = query.typeClient;
        if (query?.typeAdhesion)
            where.typeAdhesion = query.typeAdhesion;
        if (query?.etapeAdhesion)
            where.etapeAdhesion = query.etapeAdhesion;
        if (query?.service)
            where.service = query.service;
        if (query?.agentResponsable)
            where.agentResponsable = query.agentResponsable;
        if (query?.contactId)
            where.contactId = query.contactId;
        return this.prisma.deal.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const deal = await this.prisma.deal.findUnique({
            where: { id },
        });
        if (!deal) {
            throw new common_1.NotFoundException(`Deal ${id} introuvable`);
        }
        return deal;
    }
    create(data) {
        const payload = {
            ...data,
            dateDemande: data.dateDemande ? new Date(data.dateDemande) : null,
            dateValidation: data.dateValidation ? new Date(data.dateValidation) : null,
            dateActivation: data.dateActivation ? new Date(data.dateActivation) : null,
            etapeAdhesion: data.etapeAdhesion || 'Prospect identifié',
            typeClient: data.typeClient || 'Individuel',
        };
        return this.prisma.deal.create({
            data: payload,
        });
    }
    async update(id, data) {
        await this.findOne(id);
        const payload = {
            ...data,
            dateDemande: data.dateDemande ? new Date(data.dateDemande) : null,
            dateValidation: data.dateValidation ? new Date(data.dateValidation) : null,
            dateActivation: data.dateActivation ? new Date(data.dateActivation) : null,
        };
        return this.prisma.deal.update({
            where: { id },
            data: payload,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.deal.delete({ where: { id } });
    }
};
exports.DealsService = DealsService;
exports.DealsService = DealsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DealsService);
//# sourceMappingURL=deals.service.js.map