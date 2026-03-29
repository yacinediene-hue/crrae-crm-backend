const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {

  const demandes = [
    {
      numDemande: "DEMS-00001",
      nomPrenom: "Mame Ndiaye",
      matricule: "CRR-2026-001",
      typeClient: "Retraité",
      pays: "Sénégal",
      canal: "WhatsApp",
      telephone: "+221770000000",
      objetDemande: "Liquidation pension",
      commentaire: "Demande d'information sur la liquidation de pension",
      service: "DPR",
      agentN1: "Caroline OKOBE",
      priorite: "Normale",
      statut: "En cours",
      dateReception: new Date("2026-03-10")
    },

    {
      numDemande: "DEMS-00002",
      nomPrenom: "Georges Alain",
      matricule: "CRR-2026-002",
      typeClient: "Actif",
      pays: "Côte d'Ivoire",
      canal: "Téléphone",
      telephone: "+2250700000000",
      objetDemande: "Cotisations",
      commentaire: "Vérification des cotisations versées",
      service: "DCR",
      agentN1: "Séverine KPODA",
      priorite: "Haute",
      statut: "En cours",
      dateReception: new Date("2026-03-11")
    },

    {
      numDemande: "DEMS-00003",
      nomPrenom: "Mamadou Ba",
      matricule: "CRR-2026-003",
      typeClient: "Retraité",
      pays: "Mali",
      canal: "Email",
      email: "mamadou.ba@email.com",
      objetDemande: "Réclamation",
      commentaire: "Retard dans le paiement de la pension",
      service: "DPR",
      agentN1: "Fatou KAMAGATE",
      priorite: "Critique",
      statut: "En cours",
      dateReception: new Date("2026-03-05")
    },

    {
      numDemande: "DEMS-00004",
      nomPrenom: "Jean Kouassi",
      matricule: "CRR-2026-004",
      typeClient: "Retraité",
      pays: "Côte d'Ivoire",
      canal: "WhatsApp",
      telephone: "+2250500000000",
      objetDemande: "Attestation de pension",
      commentaire: "Besoin d'une attestation pour la banque",
      service: "DPR",
      agentN1: "Koffi STEPHANE",
      priorite: "Normale",
      statut: "Traité",
      dateReception: new Date("2026-03-01"),
      dateTraitement: new Date("2026-03-03")
    },

    {
      numDemande: "DEMS-00005",
      nomPrenom: "Fatoumata Traoré",
      matricule: "CRR-2026-005",
      typeClient: "Actif",
      pays: "Burkina Faso",
      canal: "Téléphone",
      telephone: "+22670000000",
      objetDemande: "Affiliation",
      commentaire: "Information sur l'affiliation au régime",
      service: "DCR",
      agentN1: "Caroline OKOBE",
      priorite: "Normale",
      statut: "En cours",
      dateReception: new Date("2026-03-12")
    }
  ]

  for (const demande of demandes) {
    await prisma.demande.upsert({
      where: { numDemande: demande.numDemande },
      update: demande,
      create: demande
    })
  }

  console.log("✅ Seed demandes terminé")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
