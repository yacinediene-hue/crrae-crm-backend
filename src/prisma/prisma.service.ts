import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    await this.applySchemaFixes();
  }

  private async applySchemaFixes() {
    const run = async (sql: string) => {
      try { await this.$executeRawUnsafe(sql); }
      catch { /* déjà appliqué ou non applicable */ }
    };

    // Deal — supprimer les contraintes NOT NULL héritées du schéma initial
    await run(`ALTER TABLE "Deal" ALTER COLUMN "contactId"    DROP NOT NULL`);
    await run(`ALTER TABLE "Deal" ALTER COLUMN "title"        DROP NOT NULL`);
    await run(`ALTER TABLE "Deal" ALTER COLUMN "title"        SET DEFAULT ''`);
    await run(`ALTER TABLE "Deal" ALTER COLUMN "value"        DROP NOT NULL`);
    await run(`ALTER TABLE "Deal" ALTER COLUMN "value"        SET DEFAULT 0`);
    await run(`ALTER TABLE "Deal" ALTER COLUMN "probability"  DROP NOT NULL`);
    await run(`ALTER TABLE "Deal" ALTER COLUMN "probability"  SET DEFAULT 0`);
    await run(`UPDATE "Deal" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL`);
    await run(`UPDATE "Deal" SET "nomPrenom" = 'Non renseigné' WHERE "nomPrenom" IS NULL`);

    this.logger.log('Schema fixes applied');
  }
}
