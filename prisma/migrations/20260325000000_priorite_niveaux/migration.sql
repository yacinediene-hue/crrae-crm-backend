-- Migration: Mise à jour des niveaux de priorité
-- Anciens : Normale, Élevée, Critique
-- Nouveaux : Faible, Moyen, Élevé, Urgent

UPDATE "Demande" SET "priorite" = 'Urgent' WHERE "priorite" = 'Critique';
UPDATE "Demande" SET "priorite" = 'Élevé'  WHERE "priorite" = 'Élevée';
UPDATE "Demande" SET "priorite" = 'Moyen'  WHERE "priorite" = 'Normale' OR "priorite" IS NULL;

ALTER TABLE "Demande" ALTER COLUMN "priorite" SET DEFAULT 'Moyen';
