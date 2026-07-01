import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AuditService } from '../audit/audit.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private emailService;
    private auditService;
    constructor(prisma: PrismaService, jwtService: JwtService, emailService: EmailService, auditService: AuditService);
    login(email: string, password: string, ip?: string): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            avatar: string;
        };
    }>;
    verifyOtp(otpToken: string, code: string, ip?: string): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            avatar: string;
        };
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
}
