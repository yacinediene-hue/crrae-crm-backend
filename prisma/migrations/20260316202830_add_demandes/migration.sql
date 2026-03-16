-- CreateTable
CREATE TABLE "Demande" (
    "id" TEXT NOT NULL,
    "numDemande" TEXT,
    "nomPrenom" TEXT NOT NULL,
    "matricule" TEXT,
    "adherent" TEXT,
    "typeClient" TEXT NOT NULL DEFAULT 'Actif',
    "pays" TEXT,
    "heureAppel" TEXT,
    "canal" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "objetDemande" TEXT,
    "commentaire" TEXT,
    "agentN1" TEXT,
    "service" TEXT,
    "agentN2" TEXT,
    "dateReception" TIMESTAMP(3),
    "dateTraitement" TIMESTAMP(3),
    "statut" TEXT NOT NULL DEFAULT 'En cours',
    "actionMenee" TEXT,
    "delaiTraitement" INTEGER,
    "respectDelai" TEXT,
    "canalCommunication" TEXT,
    "noteSatisfaction" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Demande_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Demande_numDemande_key" ON "Demande"("numDemande");
