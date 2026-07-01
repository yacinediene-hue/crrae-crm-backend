import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    const result: any = { ok: false };
    try {
      const raw: any[] = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM "Demande"`);
      result.rawCount = Number(raw[0]?.cnt ?? 0);
    } catch (e: any) {
      result.rawError = e.message;
    }
    try {
      const rows = await this.prisma.demande.findMany({ take: 1, orderBy: { createdAt: 'desc' } });
      result.prismaCount = rows.length;
      result.ok = true;
    } catch (e: any) {
      result.prismaError = e.message;
    }
    return result;
  }
}
