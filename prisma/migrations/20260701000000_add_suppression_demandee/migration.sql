-- AlterTable
ALTER TABLE "Demande" ADD COLUMN "suppressionDemandee" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Demande" ADD COLUMN "suppressionDemandeePar" TEXT;
