CREATE TABLE "PieceJointe" (
  "id"        TEXT NOT NULL,
  "dealId"    TEXT NOT NULL,
  "nom"       TEXT NOT NULL,
  "type"      TEXT NOT NULL,
  "taille"    INTEGER NOT NULL,
  "contenu"   BYTEA NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PieceJointe_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "PieceJointe" ADD CONSTRAINT "PieceJointe_dealId_fkey"
  FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
