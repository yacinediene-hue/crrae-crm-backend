const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    // Fix User — resetToken columns
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpires" TIMESTAMP(3)`
    );

    // Fix Deal — colonnes ajoutées dans 20260329232010_refonte_deals_adhesions
    // ADD avec default null pour éviter l'erreur NOT NULL sur table non vide
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "nomPrenom" TEXT`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3)`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "agentResponsable" TEXT`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "canalAcquisition" TEXT`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "commentaire" TEXT`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "dateActivation" TIMESTAMP(3)`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "dateDemande" TIMESTAMP(3)`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "dateValidation" TIMESTAMP(3)`
    );

    console.log('[startup] Schema fixes applied OK');
  } catch (e) {
    console.error('[startup] Error:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
