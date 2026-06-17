import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailService } from '../email/email.service';

@Module({
  imports: [PrismaModule],
  providers: [BackupService, EmailService],
  exports: [BackupService],
})
export class BackupModule {}
