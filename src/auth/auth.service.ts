import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  async login(email: string, password: string, ip?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.active) {
      await this.auditService.log({ auteur: email, action: 'LOGIN_FAILED', entite: 'Auth', detail: 'Compte inexistant ou inactif', ip });
      throw new UnauthorizedException('Identifiants invalides');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await this.auditService.log({ auteur: user.name, auteurId: user.id, role: user.role, action: 'LOGIN_FAILED', entite: 'Auth', detail: 'Mot de passe incorrect', ip });
      throw new UnauthorizedException('Identifiants invalides');
    }

    await this.auditService.log({ auteur: user.name, auteurId: user.id, role: user.role, action: 'LOGIN_SUCCESS', entite: 'Auth', ip });

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    };
  }

  async verifyOtp(otpToken: string, code: string, ip?: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(otpToken);
    } catch {
      throw new UnauthorizedException('Session OTP expirée. Reconnectez-vous.');
    }
    if (payload.scope !== 'otp_pending') throw new UnauthorizedException('Token invalide');

    const userId = payload.sub;
    const otp = await this.prisma.otpCode.findFirst({
      where: { userId, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.code !== code) {
      await this.auditService.log({ auteur: userId, auteurId: userId, action: 'OTP_FAILED', entite: 'Auth', detail: 'Code incorrect ou expiré', ip });
      throw new UnauthorizedException('Code invalide ou expiré');
    }

    await this.prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');

    await this.auditService.log({ auteur: user.name, auteurId: user.id, role: user.role, action: 'OTP_SUCCESS', entite: 'Auth', ip });

    const fullPayload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(fullPayload),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) return { message: 'Si cet email existe, un lien a été envoyé.' };

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({ where: { email }, data: { resetToken: token, resetTokenExpires: expires } });

    const frontendUrl = process.env.FRONTEND_URL || 'https://crm.relationclient-crrae.org';
    await this.emailService.envoyerResetPassword(email, user.name, `${frontendUrl}/reset-password?token=${token}`);

    return { message: 'Si cet email existe, un lien a été envoyé.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpires: { gt: new Date() } },
    });
    if (!user) throw new BadRequestException('Lien invalide ou expiré.');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash, resetToken: null, resetTokenExpires: null } });
    await this.auditService.log({ auteur: user.name, auteurId: user.id, role: user.role, action: 'PASSWORD_RESET', entite: 'Auth' });

    return { message: 'Mot de passe réinitialisé avec succès.' };
  }
}
