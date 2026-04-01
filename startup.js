const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function applyFixes() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpires" TIMESTAMP(3);
    `);
    console.log('[startup] Colonnes resetToken vérifiées/appliquées.');
  } catch (e) {
    console.error('[startup] Erreur SQL fix:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

applyFixes();
