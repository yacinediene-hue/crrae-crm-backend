import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Réponse identique que l'email existe ou non (sécurité)
    if (!user || !user.active) return { message: 'Si cet email existe, un lien a été envoyé.' };

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await this.prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpires: expires },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'https://crm.relationclient-crrae.org';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await this.emailService.envoyerResetPassword(email, user.name, resetLink);

    return { message: 'Si cet email existe, un lien a été envoyé.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) throw new BadRequestException('Lien invalide ou expiré.');

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpires: null },
    });

    return { message: 'Mot de passe réinitialisé avec succès.' };
  }
}
