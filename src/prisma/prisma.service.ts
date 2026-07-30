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

    // TypeDemande — référentiel CMR (créer si absent)
    await run(`CREATE TABLE IF NOT EXISTS "TypeDemande" (
      "id" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "libelle" TEXT NOT NULL,
      "delaiMaxJours" INTEGER,
      "actif" BOOLEAN NOT NULL DEFAULT true,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TypeDemande_pkey" PRIMARY KEY ("id")
    )`);
    await run(`CREATE UNIQUE INDEX IF NOT EXISTS "TypeDemande_slug_key" ON "TypeDemande"("slug")`);

    // HistoriqueTypeDemande
    await run(`CREATE TABLE IF NOT EXISTS "HistoriqueTypeDemande" (
      "id" TEXT NOT NULL,
      "typeDemandeId" TEXT NOT NULL,
      "auteur" TEXT NOT NULL,
      "auteurId" TEXT,
      "champ" TEXT NOT NULL,
      "ancienneValeur" TEXT,
      "nouvelleValeur" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "HistoriqueTypeDemande_pkey" PRIMARY KEY ("id")
    )`);
    await run(`ALTER TABLE "HistoriqueTypeDemande" ADD CONSTRAINT "HistoriqueTypeDemande_typeDemandeId_fkey"
      FOREIGN KEY ("typeDemandeId") REFERENCES "TypeDemande"("id") ON DELETE CASCADE ON UPDATE CASCADE`);

    // Demande — nouvelles colonnes SLA CMR
    await run(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "typeDemandeId" TEXT`);
    await run(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "dateLimite" TIMESTAMP(3)`);
    await run(`ALTER TABLE "Demande" ADD CONSTRAINT "Demande_typeDemandeId_fkey"
      FOREIGN KEY ("typeDemandeId") REFERENCES "TypeDemande"("id") ON DELETE SET NULL ON UPDATE CASCADE`);

    this.logger.log('Schema fixes applied');
  }
}
