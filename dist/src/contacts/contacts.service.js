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
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ContactsService = class ContactsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(query) {
        const where = {};
        if (query?.status)
            where.status = query.status;
        if (query?.assignedTo)
            where.assignedTo = query.assignedTo;
        if (query?.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
                { company: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    async findOne(id) {
        const contact = await this.prisma.contact.findUnique({ where: { id } });
        if (!contact)
            throw new common_1.NotFoundException(`Contact ${id} introuvable`);
        return contact;
    }
    create(data) {
        return this.prisma.contact.create({ data });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.contact.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.contact.delete({ where: { id } });
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map