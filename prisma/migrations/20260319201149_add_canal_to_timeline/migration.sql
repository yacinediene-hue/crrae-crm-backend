-- CreateTable
CREATE TABLE "Timeline" (
    "id" TEXT NOT NULL,
    "demandeId" TEXT NOT NULL,
    "auteur" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "canal" TEXT,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Timeline_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Timeline" ADD CONSTRAINT "Timeline_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE CASCADE ON UPDATE CASCADE;
