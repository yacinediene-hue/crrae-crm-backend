-- Créer l'enum CanalDemande
CREATE TYPE "CanalDemande" AS ENUM (
  'EMAIL',
  'TELEPHONE',
  'WHATSAPP',
  'SITE_WEB',
  'GUICHET',
  'LINKEDIN',
  'FACEBOOK',
  'AUTRE'
);

-- Convertir les valeurs existantes vers l'enum (valeurs non reconnues → NULL)
ALTER TABLE "Demande"
  ALTER COLUMN "canal" DROP DEFAULT,
  ALTER COLUMN "canal" TYPE "CanalDemande"
    USING CASE "canal"
      WHEN 'Email'     THEN 'EMAIL'::"CanalDemande"
      WHEN 'email'     THEN 'EMAIL'::"CanalDemande"
      WHEN 'Téléphone' THEN 'TELEPHONE'::"CanalDemande"
      WHEN 'telephone' THEN 'TELEPHONE'::"CanalDemande"
      WHEN 'WhatsApp'  THEN 'WHATSAPP'::"CanalDemande"
      WHEN 'whatsapp'  THEN 'WHATSAPP'::"CanalDemande"
      WHEN 'Site web'  THEN 'SITE_WEB'::"CanalDemande"
      WHEN 'Guichet'   THEN 'GUICHET'::"CanalDemande"
      WHEN 'LinkedIn'  THEN 'LINKEDIN'::"CanalDemande"
      WHEN 'Facebook'  THEN 'FACEBOOK'::"CanalDemande"
      ELSE NULL
    END;
