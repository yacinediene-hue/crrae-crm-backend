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

    // PieceJointe
    await exec(`CREATE TABLE IF NOT EXISTS "PieceJointe" ("id" TEXT NOT NULL, "dealId" TEXT NOT NULL, "nom" TEXT NOT NULL, "type" TEXT NOT NULL, "taille" INTEGER NOT NULL, "contenu" BYTEA NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PieceJointe_pkey" PRIMARY KEY ("id"), CONSTRAINT "PieceJointe_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE)`);

    console.log('[startup] Schema fixes applied OK');
  } finally {
    await prisma.$disconnect();
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error('[startup] Fatal:', e.message); process.exit(1); });
