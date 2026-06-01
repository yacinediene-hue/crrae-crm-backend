import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
