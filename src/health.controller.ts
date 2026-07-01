import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      const rows: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as cnt FROM "Demande"`,
      );
      const cols: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'Demande' ORDER BY ordinal_position`,
      );
      return {
        ok: true,
        demandeCount: Number(rows[0]?.cnt ?? 0),
        columns: cols.map(c => c.column_name),
      };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }
}
