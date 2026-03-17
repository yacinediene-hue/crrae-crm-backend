import { Module } from '@nestjs/common';
import { EnquetesController } from './enquetes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EnquetesController],
})
export class EnquetesModule {}
