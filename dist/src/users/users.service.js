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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(query) {
        const where = {};
        if (query?.role)
            where.role = query.role;
        if (query?.active !== undefined)
            where.active = query.active === 'true';
        return this.prisma.user.findMany({
            where,
            select: { id: true, name: true, email: true, role: true, avatar: true, active: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const item = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, role: true, avatar: true, active: true, createdAt: true },
        });
        if (!item)
            throw new common_1.NotFoundException(`User ${id} introuvable`);
        return item;
    }
    async create(data) {
        if (data.password) {
            data.passwordHash = await bcrypt.hash(data.password, 10);
            delete data.password;
        }
        return this.prisma.user.create({
            data,
            select: { id: true, name: true, email: true, role: true, avatar: true, active: true, createdAt: true },
        });
    }
    async update(id, data) {
        await this.findOne(id);
        if (data.password) {
            data.passwordHash = await bcrypt.hash(data.password, 10);
            delete data.password;
        }
        return this.prisma.user.update({
            where: { id },
            data,
            select: { id: true, name: true, email: true, role: true, avatar: true, active: true, createdAt: true },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.user.delete({ where: { id } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map