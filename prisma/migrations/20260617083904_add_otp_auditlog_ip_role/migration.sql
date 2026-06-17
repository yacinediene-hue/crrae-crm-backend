-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "ip" TEXT,
ADD COLUMN     "role" TEXT;

-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "title" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "nomPrenom" DROP NOT NULL,
ALTER COLUMN "nomPrenom" SET DEFAULT 'Non renseigné',
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);
