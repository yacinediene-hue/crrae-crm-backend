import { Module } from '@nestjs/common';
import { AlertesService } from './alertes.service';
import { AlertesController } from './alertes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailService } from '../email/email.service';

@Module({
  imports: [PrismaModule],
  providers: [AlertesService, EmailService],
  controllers: [AlertesController],
})
export class AlertesModule {}
