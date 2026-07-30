const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  // Chaque commande a son propre try/catch — une erreur n'arrête pas les suivantes
  const exec = async (sql) => {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (e) {
      console.warn('[startup] skip:', e.message.split('\n')[0]);
    }
  };

  try {
    // User
    await exec(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT`);
    await exec(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpires" TIMESTAMP(3)`);
    await exec(`ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL`);

    // Contact
    await exec(`ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "profilClient" TEXT`);
    await exec(`ALTER TABLE "Contact" ALTER COLUMN "email" DROP NOT NULL`);

    // Deal — DROP NOT NULL sur colonnes héritées du schéma initial
    await exec(`ALTER TABLE "Deal" ALTER COLUMN "contactId" DROP NOT NULL`);
    await exec(`ALTER TABLE "Deal" ALTER COLUMN "title"     DROP NOT NULL`);
    await exec(`ALTER TABLE "Deal" ALTER COLUMN "title"     SET DEFAULT ''`);
    await exec(`ALTER TABLE "Deal" ALTER COLUMN "value"     DROP NOT NULL`);
    await exec(`ALTER TABLE "Deal" ALTER COLUMN "value"     SET DEFAULT 0`);
    await exec(`ALTER TABLE "Deal" ALTER COLUMN "probability" DROP NOT NULL`);
    await exec(`ALTER TABLE "Deal" ALTER COLUMN "probability" SET DEFAULT 0`);

    // Deal — nouvelles colonnes
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "nomPrenom" TEXT`);
    await exec(`UPDATE "Deal" SET "nomPrenom" = 'Non renseigné' WHERE "nomPrenom" IS NULL`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "institution" TEXT`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "pays" TEXT`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "telephone" TEXT`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "email" TEXT`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "typeClient" TEXT DEFAULT 'Individuel'`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "typeAdhesion" TEXT`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "modeAdhesion" TEXT`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "etapeAdhesion" TEXT DEFAULT 'Prospect identifié'`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "documentsAttendus" TEXT`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "documentsManquants" TEXT`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "service" TEXT`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3)`);
    await exec(`UPDATE "Deal" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "agentResponsable" TEXT`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "canalAcquisition" TEXT`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "commentaire" TEXT`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "dateActivation" TIMESTAMP(3)`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "dateDemande" TIMESTAMP(3)`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "dateValidation" TIMESTAMP(3)`);

    // Campaign
    await exec(`ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "canal" TEXT`);
    await exec(`ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "content" TEXT`);
    await exec(`ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "profilClient" TEXT`);
    await exec(`ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "statut" TEXT DEFAULT 'draft'`);
    await exec(`ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "tag" TEXT`);
    await exec(`ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "dateEnvoi" TIMESTAMP(3)`);

    // AuditLog
    await exec(`CREATE TABLE IF NOT EXISTS "AuditLog" ("id" TEXT NOT NULL, "auteur" TEXT NOT NULL DEFAULT 'Système', "auteurId" TEXT, "action" TEXT NOT NULL DEFAULT '', "entite" TEXT NOT NULL DEFAULT '', "entiteId" TEXT, "detail" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"))`);
    await exec(`ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "auteur"   TEXT NOT NULL DEFAULT 'Système'`);
    await exec(`ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "auteurId" TEXT`);
    await exec(`ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "action"   TEXT NOT NULL DEFAULT ''`);
    await exec(`ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "entite"   TEXT NOT NULL DEFAULT ''`);
    await exec(`ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "entiteId" TEXT`);
    await exec(`ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "detail"   TEXT`);

    // Demande
    await exec(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "priorite" TEXT DEFAULT 'Moyen'`);
    await exec(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "enqueteEnvoyee" BOOLEAN NOT NULL DEFAULT false`);
    await exec(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "dateEnvoiEnquete" TIMESTAMP(3)`);
    await exec(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "niveauTraitement" INTEGER NOT NULL DEFAULT 1`);
    await exec(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "dateEscalade" TIMESTAMP(3)`);
    await exec(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "commentaireEscalade" TEXT`);
    await exec(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "suppressionDemandee" BOOLEAN NOT NULL DEFAULT false`);
    await exec(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "suppressionDemandeePar" TEXT`);

    // DocumentDemande — pièces jointes des demandes
    await exec(`CREATE TABLE IF NOT EXISTS "DocumentDemande" ("id" TEXT NOT NULL, "demandeId" TEXT NOT NULL, "nom" TEXT NOT NULL, "type" TEXT NOT NULL, "taille" INTEGER NOT NULL, "contenu" BYTEA NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "DocumentDemande_pkey" PRIMARY KEY ("id"), CONSTRAINT "DocumentDemande_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE CASCADE ON UPDATE CASCADE)`);

    // PieceJointe
    await exec(`CREATE TABLE IF NOT EXISTS "PieceJointe" ("id" TEXT NOT NULL, "dealId" TEXT NOT NULL, "nom" TEXT NOT NULL, "type" TEXT NOT NULL, "taille" INTEGER NOT NULL, "contenu" BYTEA NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PieceJointe_pkey" PRIMARY KEY ("id"), CONSTRAINT "PieceJointe_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE)`);

    // TypeDemande — référentiel CMR des délais réglementaires
    await exec(`CREATE TABLE IF NOT EXISTS "TypeDemande" ("id" TEXT NOT NULL, "slug" TEXT NOT NULL, "libelle" TEXT NOT NULL, "delaiMaxJours" INTEGER, "actif" BOOLEAN NOT NULL DEFAULT true, "notes" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "TypeDemande_pkey" PRIMARY KEY ("id"))`);
    await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "TypeDemande_slug_key" ON "TypeDemande"("slug")`);

    // HistoriqueTypeDemande — audit trail des modifications admin
    await exec(`CREATE TABLE IF NOT EXISTS "HistoriqueTypeDemande" ("id" TEXT NOT NULL, "typeDemandeId" TEXT NOT NULL, "auteur" TEXT NOT NULL, "auteurId" TEXT, "champ" TEXT NOT NULL, "ancienneValeur" TEXT, "nouvelleValeur" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "HistoriqueTypeDemande_pkey" PRIMARY KEY ("id"), CONSTRAINT "HistoriqueTypeDemande_typeDemandeId_fkey" FOREIGN KEY ("typeDemandeId") REFERENCES "TypeDemande"("id") ON DELETE CASCADE ON UPDATE CASCADE)`);

    // Demande — nouvelles colonnes SLA CMR
    await exec(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "typeDemandeId" TEXT`);
    await exec(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "dateLimite" TIMESTAMP(3)`);
    await exec(`ALTER TABLE "Demande" ADD CONSTRAINT "Demande_typeDemandeId_fkey" FOREIGN KEY ("typeDemandeId") REFERENCES "TypeDemande"("id") ON DELETE SET NULL ON UPDATE CASCADE`);

    // Seed des 31 types de demande CMR (idempotent via ON CONFLICT DO NOTHING)
    const { randomUUID } = require('crypto');
    const typesCmr = [
      { slug: 'attestation-affiliation',       libelle: "Demande d'attestation d'affiliation",              delaiMaxJours: 2,    actif: true  },
      { slug: 'bulletins-pension',              libelle: "Demande de bulletins de pension",                  delaiMaxJours: 2,    actif: true  },
      { slug: 'correction-donnees',             libelle: "Demande de correction de données",                 delaiMaxJours: 2,    actif: true  },
      { slug: 'simulation-pension',             libelle: "Demande de simulation de pension",                 delaiMaxJours: 2,    actif: true  },
      { slug: 'releve-cotisation',              libelle: "Demande de relevé de cotisation",                  delaiMaxJours: 2,    actif: true  },
      { slug: 'domiciliation',                  libelle: "Demande de domiciliation",                         delaiMaxJours: 2,    actif: true  },
      { slug: 'attestation-pension',            libelle: "Demande d'attestation de pension",                 delaiMaxJours: 2,    actif: true  },
      { slug: 'prise-en-charge',                libelle: "Demande de prise en charge",                       delaiMaxJours: 2,    actif: true  },
      { slug: 'entente-prealable',              libelle: "Demande d'entente préalable",                      delaiMaxJours: 2,    actif: true  },
      { slug: 'evacuation-sanitaire',           libelle: "Évacuation sanitaire",                             delaiMaxJours: 1,    actif: true  },
      { slug: 'attestation-assurance-maladie',  libelle: "Demande d'attestation d'assurance maladie",        delaiMaxJours: 2,    actif: true  },
      { slug: 'liquidation-retraite',           libelle: "Demande de liquidation de pension de retraite",    delaiMaxJours: 60,   actif: true  },
      { slug: 'poursuite-cotisation-ai-av',     libelle: "Poursuite de cotisation AI/AV",                   delaiMaxJours: 2,    actif: true  },
      { slug: 'remboursement-frais-medicaux',   libelle: "Remboursement des frais médicaux",                 delaiMaxJours: 15,   actif: true  },
      { slug: 'reclamation-pension',            libelle: "Demande de réclamation pension",                   delaiMaxJours: 2,    actif: true  },
      { slug: 'info-pension',                   libelle: "Demande d'information simple sur pension",         delaiMaxJours: 2,    actif: true  },
      { slug: 'pension-non-payee',              libelle: "Pension non payée",                                delaiMaxJours: 2,    actif: true  },
      { slug: 'reclamation-pension-reversion',  libelle: "Demande de réclamation pension de réversion",      delaiMaxJours: 2,    actif: true  },
      { slug: 'info-pension-reversion',         libelle: "Demande d'information simple sur pension de réversion", delaiMaxJours: 2, actif: true },
      { slug: 'adhesion-rvc',                   libelle: "Demande d'adhésion au RVC",                        delaiMaxJours: 2,    actif: true  },
      { slug: 'retrait-rvc',                    libelle: "Demande de retrait RVC",                           delaiMaxJours: null, actif: false },
      { slug: 'info-rvc',                       libelle: "Demande d'information sur le RVC",                 delaiMaxJours: 2,    actif: true  },
      { slug: 'reclamation-rvc',                libelle: "Réclamation sur RVC",                              delaiMaxJours: 2,    actif: true  },
      { slug: 'info-cotisations-affiliation',   libelle: "Informations simples sur les cotisations / Affiliation", delaiMaxJours: 2, actif: true },
      { slug: 'adhesion-assurance-maladie-faam',libelle: "Adhésion à l'Assurance Maladie - FAAM",            delaiMaxJours: 90,   actif: true  },
      { slug: 'carte-assurance-faam',           libelle: "Demande de carte d'assurance FAAM",                delaiMaxJours: null, actif: false },
      { slug: 'assistance-technique-plateforme',libelle: "Assistance technique – Plateforme en ligne",       delaiMaxJours: 2,    actif: true  },
      { slug: 'certificat-de-vie',              libelle: "Certificat de vie",                                delaiMaxJours: 2,    actif: true  },
      { slug: 'location-salle',                 libelle: "Location de salle",                                delaiMaxJours: 2,    actif: true  },
      { slug: 'autre-demande-reclamation',      libelle: "Autre demande ou réclamation",                     delaiMaxJours: 2,    actif: true  },
      { slug: 'services-informations-generales',libelle: "Services et informations générales",               delaiMaxJours: 1,    actif: true  },
    ];
    for (const t of typesCmr) {
      const delai = t.delaiMaxJours === null ? 'NULL' : t.delaiMaxJours;
      const libelle = t.libelle.replace(/'/g, "''");
      await exec(`INSERT INTO "TypeDemande" ("id","slug","libelle","delaiMaxJours","actif","createdAt","updatedAt") VALUES ('${randomUUID()}','${t.slug}','${libelle}',${delai},${t.actif},NOW(),NOW()) ON CONFLICT ("slug") DO NOTHING`);
    }

    console.log('[startup] Schema fixes applied OK');
  } finally {
    await prisma.$disconnect();
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error('[startup] Fatal:', e.message); process.exit(1); });
