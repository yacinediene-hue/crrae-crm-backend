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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const audit_service_1 = require("../audit/audit.service");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
let AuthService = class AuthService {
    constructor(prisma, jwtService, emailService, auditService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.auditService = auditService;
    }
    async login(email, password, ip) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || !user.active) {
            await this.auditService.log({ auteur: email, action: 'LOGIN_FAILED', entite: 'Auth', detail: 'Compte inexistant ou inactif', ip });
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            await this.auditService.log({ auteur: user.name, auteurId: user.id, role: user.role, action: 'LOGIN_FAILED', entite: 'Auth', detail: 'Mot de passe incorrect', ip });
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        await this.auditService.log({ auteur: user.name, auteurId: user.id, role: user.role, action: 'LOGIN_SUCCESS', entite: 'Auth', ip });
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
        };
    }
    async verifyOtp(otpToken, code, ip) {
        let payload;
        try {
            payload = this.jwtService.verify(otpToken);
        }
        catch {
            throw new common_1.UnauthorizedException('Session OTP expirée. Reconnectez-vous.');
        }
        if (payload.scope !== 'otp_pending')
            throw new common_1.UnauthorizedException('Token invalide');
        const userId = payload.sub;
        const otp = await this.prisma.otpCode.findFirst({
            where: { userId, used: false, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
        });
        if (!otp || otp.code !== code) {
            await this.auditService.log({ auteur: userId, auteurId: userId, action: 'OTP_FAILED', entite: 'Auth', detail: 'Code incorrect ou expiré', ip });
            throw new common_1.UnauthorizedException('Code invalide ou expiré');
        }
        await this.prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('Utilisateur introuvable');
        await this.auditService.log({ auteur: user.name, auteurId: user.id, role: user.role, action: 'OTP_SUCCESS', entite: 'Auth', ip });
        const fullPayload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(fullPayload),
            user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
        };
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || !user.active)
            return { message: 'Si cet email existe, un lien a été envoyé.' };
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000);
        await this.prisma.user.update({ where: { email }, data: { resetToken: token, resetTokenExpires: expires } });
        const frontendUrl = process.env.FRONTEND_URL || 'https://crm.relationclient-crrae.org';
        await this.emailService.envoyerResetPassword(email, user.name, `${frontendUrl}/reset-password?token=${token}`);
        return { message: 'Si cet email existe, un lien a été envoyé.' };
    }
    async resetPassword(token, newPassword) {
        const user = await this.prisma.user.findFirst({
            where: { resetToken: token, resetTokenExpires: { gt: new Date() } },
        });
        if (!user)
            throw new common_1.BadRequestException('Lien invalide ou expiré.');
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash, resetToken: null, resetTokenExpires: null } });
        await this.auditService.log({ auteur: user.name, auteurId: user.id, role: user.role, action: 'PASSWORD_RESET', entite: 'Auth' });
        return { message: 'Mot de passe réinitialisé avec succès.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        email_service_1.EmailService,
        audit_service_1.AuditService])
], AuthService);
//# sourceMappingURL=auth.service.js.map