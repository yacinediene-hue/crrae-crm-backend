import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsDemandeController } from './documents-demande.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentsController, DocumentsDemandeController],
})
export class DocumentsModule {}
