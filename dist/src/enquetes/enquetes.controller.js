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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnquetesController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EnquetesController = class EnquetesController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEnquete(token) {
        const demande = await this.prisma.demande.findFirst({
            where: { numDemande: token },
            select: {
                id: true, numDemande: true, nomPrenom: true,
                objetDemande: true, statut: true, noteSatisfaction: true,
            }
        });
        if (!demande)
            return { error: 'Demande introuvable' };
        return demande;
    }
    async submitEnquete(token, body) {
        const demande = await this.prisma.demande.findFirst({
            where: { numDemande: token }
        });
        if (!demande)
            return { error: 'Demande introuvable' };
        return this.prisma.demande.update({
            where: { id: demande.id },
            data: {
                noteSatisfaction: parseInt(body.note),
                commentaire: (demande.commentaire || '') + (body.avis ? `\n[Avis client]: ${body.avis}` : ''),
            }
        });
    }
};
exports.EnquetesController = EnquetesController;
__decorate([
    (0, common_1.Get)(':token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnquetesController.prototype, "getEnquete", null);
__decorate([
    (0, common_1.Post)(':token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EnquetesController.prototype, "submitEnquete", null);
exports.EnquetesController = EnquetesController = __decorate([
    (0, common_1.Controller)('enquetes'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnquetesController);
//# sourceMappingURL=enquetes.controller.js.map