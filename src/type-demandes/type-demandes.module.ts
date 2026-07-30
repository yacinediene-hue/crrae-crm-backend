import { Module } from '@nestjs/common';
import { TypeDemandesController } from './type-demandes.controller';
import { TypeDemandesService } from './type-demandes.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TypeDemandesController],
  providers: [TypeDemandesService],
  exports: [TypeDemandesService],
})
export class TypeDemandesModule {}
