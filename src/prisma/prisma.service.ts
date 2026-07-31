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

    // Seed des 31 types CMR (idempotent — ON CONFLICT slug DO NOTHING)
    const { randomUUID } = await import('crypto');
    const typesCmr = [
      { slug: 'attestation-affiliation',        libelle: "Demande d''attestation d''affiliation",               delai: 2,    actif: true  },
      { slug: 'bulletins-pension',               libelle: "Demande de bulletins de pension",                     delai: 2,    actif: true  },
      { slug: 'correction-donnees',              libelle: "Demande de correction de données",                    delai: 2,    actif: true  },
      { slug: 'simulation-pension',              libelle: "Demande de simulation de pension",                    delai: 2,    actif: true  },
      { slug: 'releve-cotisation',               libelle: "Demande de relevé de cotisation",                     delai: 2,    actif: true  },
      { slug: 'domiciliation',                   libelle: "Demande de domiciliation",                            delai: 2,    actif: true  },
      { slug: 'attestation-pension',             libelle: "Demande d''attestation de pension",                   delai: 2,    actif: true  },
      { slug: 'prise-en-charge',                 libelle: "Demande de prise en charge",                          delai: 2,    actif: true  },
      { slug: 'entente-prealable',               libelle: "Demande d''entente préalable",                        delai: 2,    actif: true  },
      { slug: 'evacuation-sanitaire',            libelle: "Évacuation sanitaire",                                delai: 1,    actif: true  },
      { slug: 'attestation-assurance-maladie',   libelle: "Demande d''attestation d''assurance maladie",         delai: 2,    actif: true  },
      { slug: 'liquidation-retraite',            libelle: "Demande de liquidation de pension de retraite",       delai: 60,   actif: true  },
      { slug: 'poursuite-cotisation-ai-av',      libelle: "Poursuite de cotisation AI/AV",                      delai: 2,    actif: true  },
      { slug: 'remboursement-frais-medicaux',    libelle: "Remboursement des frais médicaux",                    delai: 15,   actif: true  },
      { slug: 'reclamation-pension',             libelle: "Demande de réclamation pension",                      delai: 2,    actif: true  },
      { slug: 'info-pension',                    libelle: "Demande d''information simple sur pension",            delai: 2,    actif: true  },
      { slug: 'pension-non-payee',               libelle: "Pension non payée",                                   delai: 2,    actif: true  },
      { slug: 'reclamation-pension-reversion',   libelle: "Demande de réclamation pension de réversion",         delai: 2,    actif: true  },
      { slug: 'info-pension-reversion',          libelle: "Demande d''information simple sur pension de réversion", delai: 2, actif: true  },
      { slug: 'adhesion-rvc',                    libelle: "Demande d''adhésion au RVC",                          delai: 2,    actif: true  },
      { slug: 'retrait-rvc',                     libelle: "Demande de retrait RVC",                              delai: null, actif: false },
      { slug: 'info-rvc',                        libelle: "Demande d''information sur le RVC",                   delai: 2,    actif: true  },
      { slug: 'reclamation-rvc',                 libelle: "Réclamation sur RVC",                                 delai: 2,    actif: true  },
      { slug: 'info-cotisations-affiliation',    libelle: "Informations simples sur les cotisations / Affiliation", delai: 2, actif: true  },
      { slug: 'adhesion-assurance-maladie-faam', libelle: "Adhésion à l''Assurance Maladie - FAAM",              delai: 90,   actif: true  },
      { slug: 'carte-assurance-faam',            libelle: "Demande de carte d''assurance FAAM",                  delai: null, actif: false },
      { slug: 'assistance-technique-plateforme', libelle: "Assistance technique - Plateforme en ligne",          delai: 2,    actif: true  },
      { slug: 'certificat-de-vie',               libelle: "Certificat de vie",                                   delai: 2,    actif: true  },
      { slug: 'location-salle',                  libelle: "Location de salle",                                   delai: 2,    actif: true  },
      { slug: 'autre-demande-reclamation',       libelle: "Autre demande ou réclamation",                        delai: 2,    actif: true  },
      { slug: 'services-informations-generales', libelle: "Services et informations générales",                  delai: 1,    actif: true  },
    ];
    for (const t of typesCmr) {
      const delaiSql = t.delai === null ? 'NULL' : String(t.delai);
      await run(
        `INSERT INTO "TypeDemande" ("id","slug","libelle","delaiMaxJours","actif","createdAt","updatedAt")
         VALUES ('${randomUUID()}','${t.slug}','${t.libelle}',${delaiSql},${t.actif},NOW(),NOW())
         ON CONFLICT ("slug") DO NOTHING`,
      );
    }

    // Migration SLA rétroactive — applique typeDemandeId + dateLimite aux anciennes demandes
    // Skips: 'Pensions (gestion et paiement)' et 'Gestion du RVC' (types décomposés, mapping ambigu)
    await run(`
      UPDATE "Demande" d
      SET
        "typeDemandeId" = td."id",
        "dateLimite"    = d."dateReception" + (td."delaiMaxJours"::text || ' days')::INTERVAL
      FROM "TypeDemande" td
      WHERE td."slug" = CASE d."objetDemande"
          WHEN 'Demande de domiciliation'                              THEN 'domiciliation'
          WHEN 'Adhésion à l''Assurance Maladie - FAAM'               THEN 'adhesion-assurance-maladie-faam'
          WHEN 'Demande de bulletins de pension'                       THEN 'bulletins-pension'
          WHEN 'Remboursement des frais médicaux'                      THEN 'remboursement-frais-medicaux'
          WHEN 'Demande d''attestation de pension'                     THEN 'attestation-pension'
          WHEN 'Certificat de vie'                                     THEN 'certificat-de-vie'
          WHEN 'Demande d''information sur les pensions de réversion'  THEN 'info-pension-reversion'
          WHEN 'Demande de liquidation de pension de retraite'         THEN 'liquidation-retraite'
          WHEN 'Adhésion au RVC'                                       THEN 'adhesion-rvc'
          WHEN 'Demande d''attestation d''assurance maladie'           THEN 'attestation-assurance-maladie'
          WHEN 'Informations sur les cotisations'                      THEN 'info-cotisations-affiliation'
          WHEN 'Assistance technique - Plateforme en ligne'            THEN 'assistance-technique-plateforme'
          WHEN 'Services et informations générales'                    THEN 'services-informations-generales'
          WHEN 'Prise en charge'                                       THEN 'prise-en-charge'
          WHEN 'Entente préalable'                                     THEN 'entente-prealable'
          WHEN 'Autre demande ou réclamation'                          THEN 'autre-demande-reclamation'
          ELSE NULL
        END
      AND d."dateLimite"     IS NULL
      AND d."typeDemandeId"  IS NULL
      AND d."dateReception"  IS NOT NULL
      AND td."delaiMaxJours" IS NOT NULL
    `);

    this.logger.log('Schema fixes applied');
  }
}
