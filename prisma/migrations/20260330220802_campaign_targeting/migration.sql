/*
  Warnings:

  - You are about to drop the column `clicks` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `opens` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `recipients` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `segment` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Campaign` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "clicks",
DROP COLUMN "opens",
DROP COLUMN "recipients",
DROP COLUMN "segment",
DROP COLUMN "sentAt",
DROP COLUMN "type",
ADD COLUMN     "canal" TEXT,
ADD COLUMN     "content" TEXT,
ADD COLUMN     "profilClient" TEXT,
ADD COLUMN     "statut" TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN     "tag" TEXT,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;
