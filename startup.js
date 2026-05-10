const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const exec = (sql) => prisma.$executeRawUnsafe(sql);
  try {
    // User
    await exec(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT`);
    await exec(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpires" TIMESTAMP(3)`);

    // Contact
    await exec(`ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "profilClient" TEXT`);

    // Deal
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "nomPrenom" TEXT`);
    await exec(`ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3)`);
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
    await exec(`CREATE TABLE IF NOT EXISTS "AuditLog" (
      "id" TEXT NOT NULL,
      "auteur" TEXT NOT NULL,
      "auteurId" TEXT,
      "action" TEXT NOT NULL,
      "entite" TEXT NOT NULL,
      "entiteId" TEXT,
      "detail" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
    )`);

    // Demande
    await exec(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "priorite" TEXT DEFAULT 'Moyen'`);
    await exec(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "enqueteEnvoyee" BOOLEAN NOT NULL DEFAULT false`);
    await exec(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "dateEnvoiEnquete" TIMESTAMP(3)`);
    await exec(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "niveauTraitement" INTEGER NOT NULL DEFAULT 1`);
    await exec(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "dateEscalade" TIMESTAMP(3)`);
    await exec(`ALTER TABLE "Demande" ADD COLUMN IF NOT EXISTS "commentaireEscalade" TEXT`);

    console.log('[startup] Schema fixes applied OK');
  } catch (e) {
    console.error('[startup] Error:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
