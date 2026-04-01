import { Module } from '@nestjs/common';
import { DemandesController } from './demandes.controller';
import { DemandesService } from './demandes.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailService } from '../email/email.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [DemandesController],
  providers: [DemandesService, EmailService],
})
export class DemandesModule {}
