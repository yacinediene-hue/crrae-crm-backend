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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const audit_service_1 = require("../audit/audit.service");
let UsersController = class UsersController {
    constructor(service, audit) {
        this.service = service;
        this.audit = audit;
    }
    findAll(query) { return this.service.findAll(query); }
    findOne(id) { return this.service.findOne(id); }
    async create(body, req) {
        const result = await this.service.create(body);
        this.audit.log({ auteur: req.user.email, auteurId: req.user.id, action: 'CREATE_USER', entite: 'User', entiteId: result.id, detail: `Création de ${result.email} (rôle: ${result.role})` });
        return result;
    }
    async update(id, body, req) {
        const result = await this.service.update(id, body);
        if (body.password) {
            this.audit.log({ auteur: req.user.email, auteurId: req.user.id, action: 'CHANGE_PASSWORD', entite: 'User', entiteId: id, detail: `Changement de mot de passe pour ${result.email}` });
        }
        else {
            this.audit.log({ auteur: req.user.email, auteurId: req.user.id, action: 'UPDATE_USER', entite: 'User', entiteId: id, detail: `Modification de ${result.email}` });
        }
        return result;
    }
    async remove(id, req) {
        const target = await this.service.findOne(id);
        const result = await this.service.remove(id);
        this.audit.log({ auteur: req.user.email, auteurId: req.user.id, action: 'DELETE_USER', entite: 'User', entiteId: id, detail: `Suppression de ${target.email}` });
        return result;
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService, audit_service_1.AuditService])
], UsersController);
//# sourceMappingURL=users.controller.js.map