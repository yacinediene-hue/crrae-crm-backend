-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "auteur" TEXT NOT NULL,
    "auteurId" TEXT,
    "action" TEXT NOT NULL,
    "entite" TEXT NOT NULL,
    "entiteId" TEXT,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
