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
exports.SurveysService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SurveysService = class SurveysService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(query) {
        const where = {};
        if (query?.contactId)
            where.contactId = query.contactId;
        if (query?.ticketId)
            where.ticketId = query.ticketId;
        return this.prisma.survey.findMany({ where, include: { contact: true, ticket: true }, orderBy: { sentAt: 'desc' } });
    }
    async findOne(id) {
        const item = await this.prisma.survey.findUnique({ where: { id }, include: { contact: true, ticket: true } });
        if (!item)
            throw new common_1.NotFoundException(`Survey ${id} introuvable`);
        return item;
    }
    create(data) {
        return this.prisma.survey.create({ data, include: { contact: true, ticket: true } });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.survey.update({ where: { id }, data, include: { contact: true, ticket: true } });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.survey.delete({ where: { id } });
    }
};
exports.SurveysService = SurveysService;
exports.SurveysService = SurveysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SurveysService);
//# sourceMappingURL=surveys.service.js.map