-- CreateTable
CREATE TABLE "Commentaire" (
    "id" TEXT NOT NULL,
    "demandeId" TEXT NOT NULL,
    "auteur" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commentaire_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Commentaire" ADD CONSTRAINT "Commentaire_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE CASCADE ON UPDATE CASCADE;
