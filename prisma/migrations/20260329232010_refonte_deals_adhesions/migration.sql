/*
  Warnings:

  - You are about to drop the column `dueDate` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `probability` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `stage` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Deal` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Deal` table. All the data in the column will be lost.
  - Added the required column `nomPrenom` to the `Deal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Deal` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_contactId_fkey";

-- AlterTable
ALTER TABLE "Deal" DROP COLUMN "dueDate",
DROP COLUMN "notes",
DROP COLUMN "probability",
DROP COLUMN "stage",
DROP COLUMN "title",
DROP COLUMN "value",
ADD COLUMN     "agentResponsable" TEXT,
ADD COLUMN     "canalAcquisition" TEXT,
ADD COLUMN     "commentaire" TEXT,
ADD COLUMN     "dateActivation" TIMESTAMP(3),
ADD COLUMN     "dateDemande" TIMESTAMP(3),
ADD COLUMN     "dateValidation" TIMESTAMP(3),
ADD COLUMN     "documentsAttendus" TEXT,
ADD COLUMN     "documentsManquants" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "etapeAdhesion" TEXT DEFAULT 'Prospect identifié',
ADD COLUMN     "institution" TEXT,
ADD COLUMN     "modeAdhesion" TEXT,
ADD COLUMN     "nomPrenom" TEXT NOT NULL,
ADD COLUMN     "pays" TEXT,
ADD COLUMN     "service" TEXT,
ADD COLUMN     "telephone" TEXT,
ADD COLUMN     "typeAdhesion" TEXT,
ADD COLUMN     "typeClient" TEXT DEFAULT 'Individuel',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "contactId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
