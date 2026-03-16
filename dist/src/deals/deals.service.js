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
        if (query?.stage)
            where.stage = query.stage;
        if (query?.contactId)
            where.contactId = query.contactId;
        return this.prisma.deal.findMany({ where, include: { contact: true }, orderBy: { createdAt: 'desc' } });
    }
    async findOne(id) {
        const deal = await this.prisma.deal.findUnique({ where: { id }, include: { contact: true } });
        if (!deal)
            throw new common_1.NotFoundException(`Deal ${id} introuvable`);
        return deal;
    }
    create(data) {
        return this.prisma.deal.create({ data, include: { contact: true } });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.deal.update({ where: { id }, data, include: { contact: true } });
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