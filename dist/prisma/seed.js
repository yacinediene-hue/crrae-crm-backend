"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding CRRAE-UMOA CRM database...');
    const passwordHash = await bcrypt.hash('crrae2026', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@crrae-umoa.org' },
        update: {},
        create: {
            name: 'Admin CRRAE',
            email: 'admin@crrae-umoa.org',
            role: 'admin',
            passwordHash,
            active: true,
        },
    });
    const agent1 = await prisma.user.upsert({
        where: { email: 'amadou.diallo@crrae-umoa.org' },
        update: {},
        create: {
            name: 'Amadou Diallo',
            email: 'amadou.diallo@crrae-umoa.org',
            role: 'agent',
            passwordHash,
            active: true,
        },
    });
    const agent2 = await prisma.user.upsert({
        where: { email: 'fatou.sow@crrae-umoa.org' },
        update: {},
        create: {
            name: 'Fatou Sow',
            email: 'fatou.sow@crrae-umoa.org',
            role: 'agent',
            passwordHash,
            active: true,
        },
    });
    console.log('Users created:', admin.email, agent1.email, agent2.email);
    const contacts = await Promise.all([
        prisma.contact.upsert({
            where: { email: 'kofi.mensah@bceao.int' },
            update: {},
            create: {
                name: 'Kofi Mensah',
                email: 'kofi.mensah@bceao.int',
                phone: '+225 07 12 34 56',
                company: 'BCEAO Côte d\'Ivoire',
                status: 'client',
                value: 2500000,
                lastContact: new Date('2026-03-10'),
                tags: ['banque', 'UEMOA', 'prioritaire'],
                notes: 'Client fidèle depuis 2020. Membre du conseil.',
                assignedTo: agent1.id,
            },
        }),
        prisma.contact.upsert({
            where: { email: 'aissatou.ba@sgbs.sn' },
            update: {},
            create: {
                name: 'Aissatou Ba',
                email: 'aissatou.ba@sgbs.sn',
                phone: '+221 77 456 78 90',
                company: 'SGBS Sénégal',
                status: 'prospect',
                value: 1800000,
                lastContact: new Date('2026-03-05'),
                tags: ['banque', 'Sénégal'],
                notes: 'Intéressée par le produit retraite complémentaire.',
                assignedTo: agent1.id,
            },
        }),
        prisma.contact.upsert({
            where: { email: 'moussa.traore@boa.ml' },
            update: {},
            create: {
                name: 'Moussa Traoré',
                email: 'moussa.traore@boa.ml',
                phone: '+223 65 23 45 67',
                company: 'BOA Mali',
                status: 'client',
                value: 3200000,
                lastContact: new Date('2026-02-28'),
                tags: ['banque', 'Mali', 'VIP'],
                notes: 'Grand compte. Contrat en cours de renouvellement.',
                assignedTo: agent2.id,
            },
        }),
        prisma.contact.upsert({
            where: { email: 'awa.kone@ecobank.ci' },
            update: {},
            create: {
                name: 'Awa Koné',
                email: 'awa.kone@ecobank.ci',
                phone: '+225 05 98 76 54',
                company: 'Ecobank Côte d\'Ivoire',
                status: 'lead',
                value: 950000,
                lastContact: new Date('2026-03-12'),
                tags: ['banque', 'UEMOA'],
                notes: 'Premier contact suite au forum UMOA 2026.',
                assignedTo: agent2.id,
            },
        }),
        prisma.contact.upsert({
            where: { email: 'ibrahim.ouedraogo@cbao.bf' },
            update: {},
            create: {
                name: 'Ibrahim Ouédraogo',
                email: 'ibrahim.ouedraogo@cbao.bf',
                phone: '+226 70 11 22 33',
                company: 'CBAO Burkina Faso',
                status: 'client',
                value: 4100000,
                lastContact: new Date('2026-03-01'),
                tags: ['banque', 'Burkina', 'prioritaire', 'VIP'],
                notes: 'Directeur régional. Négociation en cours pour extension de contrat.',
                assignedTo: admin.id,
            },
        }),
    ]);
    console.log('Contacts created:', contacts.length);
    const deals = await Promise.all([
        prisma.deal.create({
            data: {
                title: 'Contrat retraite collective BOA Mali',
                contactId: contacts[2].id,
                stage: 'negotiation',
                value: 3200000,
                probability: 75,
                dueDate: new Date('2026-04-30'),
                notes: 'Renouvellement annuel. Points à clarifier : plafond de cotisation.',
            },
        }),
        prisma.deal.create({
            data: {
                title: 'Adhésion complémentaire SGBS',
                contactId: contacts[1].id,
                stage: 'proposal',
                value: 1800000,
                probability: 50,
                dueDate: new Date('2026-05-15'),
                notes: 'Proposition envoyée. En attente de retour DRH.',
            },
        }),
        prisma.deal.create({
            data: {
                title: 'Extension couverture CBAO Burkina',
                contactId: contacts[4].id,
                stage: 'closing',
                value: 4100000,
                probability: 90,
                dueDate: new Date('2026-03-31'),
                notes: 'Dernière étape : validation juridique.',
            },
        }),
        prisma.deal.create({
            data: {
                title: 'Prospect Ecobank CI',
                contactId: contacts[3].id,
                stage: 'prospect',
                value: 950000,
                probability: 20,
                dueDate: new Date('2026-06-30'),
                notes: 'À relancer après le forum UMOA.',
            },
        }),
    ]);
    console.log('Deals created:', deals.length);
    await Promise.all([
        prisma.activity.create({
            data: {
                contactId: contacts[0].id,
                type: 'appel',
                date: new Date('2026-03-10T10:00:00'),
                note: 'Discussion sur les nouvelles modalités de cotisation 2026.',
            },
        }),
        prisma.activity.create({
            data: {
                contactId: contacts[1].id,
                type: 'email',
                date: new Date('2026-03-05T14:30:00'),
                note: 'Envoi de la proposition commerciale détaillée.',
            },
        }),
        prisma.activity.create({
            data: {
                contactId: contacts[2].id,
                type: 'réunion',
                date: new Date('2026-02-28T09:00:00'),
                note: 'Réunion de négociation à Bamako. Accord de principe obtenu.',
            },
        }),
        prisma.activity.create({
            data: {
                contactId: contacts[4].id,
                type: 'visite',
                date: new Date('2026-03-01T11:00:00'),
                note: 'Visite terrain à Ouagadougou. Rencontre DG et équipe RH.',
            },
        }),
    ]);
    console.log('Activities created');
    const tickets = await Promise.all([
        prisma.ticket.create({
            data: {
                contactId: contacts[0].id,
                type: 'réclamation',
                subject: 'Erreur sur relevé de cotisation Q4 2025',
                status: 'open',
                priority: 'high',
                assignedTo: agent1.id,
            },
        }),
        prisma.ticket.create({
            data: {
                contactId: contacts[2].id,
                type: 'information',
                subject: 'Demande de simulation retraite anticipée',
                status: 'in_progress',
                priority: 'medium',
                assignedTo: agent2.id,
            },
        }),
        prisma.ticket.create({
            data: {
                contactId: contacts[4].id,
                type: 'technique',
                subject: 'Accès portail employeur - réinitialisation mot de passe',
                status: 'resolved',
                priority: 'low',
                closedAt: new Date('2026-03-08'),
                assignedTo: agent1.id,
            },
        }),
    ]);
    console.log('Tickets created:', tickets.length);
    await Promise.all([
        prisma.survey.create({
            data: {
                ticketId: tickets[2].id,
                contactId: contacts[4].id,
                csat: 5,
                nps: 9,
                comment: 'Résolution très rapide. Équipe réactive et professionnelle.',
                sentAt: new Date('2026-03-08T16:00:00'),
                respondedAt: new Date('2026-03-09T08:30:00'),
            },
        }),
        prisma.survey.create({
            data: {
                ticketId: tickets[1].id,
                contactId: contacts[2].id,
                csat: 4,
                nps: 7,
                comment: 'Bonne simulation. Délai un peu long mais résultat satisfaisant.',
                sentAt: new Date('2026-03-10T09:00:00'),
                respondedAt: new Date('2026-03-11T11:00:00'),
            },
        }),
    ]);
    console.log('Surveys created');
    await Promise.all([
        prisma.campaign.create({
            data: {
                name: 'Newsletter Q1 2026 UEMOA',
                type: 'email',
                status: 'sent',
                segment: 'clients_actifs',
                subject: 'Actualités CRRAE-UMOA : résultats 2025 et perspectives',
                sentAt: new Date('2026-01-15'),
                recipients: 1247,
                opens: 623,
                clicks: 187,
            },
        }),
        prisma.campaign.create({
            data: {
                name: 'Relance prospects banques Q1 2026',
                type: 'email',
                status: 'sent',
                segment: 'prospects_banques',
                subject: 'Découvrez nos solutions retraite complémentaire 2026',
                sentAt: new Date('2026-02-10'),
                recipients: 342,
                opens: 198,
                clicks: 67,
            },
        }),
        prisma.campaign.create({
            data: {
                name: 'Forum UMOA 2026 - Invitation',
                type: 'email',
                status: 'draft',
                segment: 'tous_contacts',
                subject: 'Invitation Forum UMOA 2026 - Abidjan',
            },
        }),
    ]);
    console.log('Campaigns created');
    await Promise.all([
        prisma.event.create({
            data: {
                title: 'Appel de suivi - Kofi Mensah',
                contactId: contacts[0].id,
                date: new Date('2026-03-20'),
                time: '10:00',
                type: 'appel',
                note: 'Faire le point sur la réclamation en cours.',
                done: false,
            },
        }),
        prisma.event.create({
            data: {
                title: 'Réunion de clôture CBAO',
                contactId: contacts[4].id,
                date: new Date('2026-03-25'),
                time: '14:00',
                type: 'réunion',
                note: 'Signature finale du contrat étendu.',
                done: false,
            },
        }),
        prisma.event.create({
            data: {
                title: 'Présentation produit - Ecobank CI',
                contactId: contacts[3].id,
                date: new Date('2026-04-05'),
                time: '09:30',
                type: 'présentation',
                note: 'Première démonstration complète des produits CRRAE.',
                done: false,
            },
        }),
        prisma.event.create({
            data: {
                title: 'Appel de relance - Aissatou Ba',
                contactId: contacts[1].id,
                date: new Date('2026-03-18'),
                time: '11:00',
                type: 'appel',
                note: 'Relance suite à proposition commerciale non répondue.',
                done: false,
            },
        }),
    ]);
    console.log('Events created');
    await Promise.all([
        prisma.contract.create({
            data: {
                contactId: contacts[0].id,
                title: 'Contrat Retraite Collective BCEAO CI 2026',
                status: 'active',
                startDate: new Date('2026-01-01'),
                endDate: new Date('2026-12-31'),
                value: 2500000,
            },
        }),
        prisma.contract.create({
            data: {
                contactId: contacts[2].id,
                title: 'Convention BOA Mali - Retraite & Prévoyance',
                status: 'renewal',
                startDate: new Date('2025-05-01'),
                endDate: new Date('2026-04-30'),
                value: 3200000,
            },
        }),
        prisma.contract.create({
            data: {
                contactId: contacts[4].id,
                title: 'Contrat CBAO Burkina - Extension 2026',
                status: 'draft',
                startDate: new Date('2026-04-01'),
                endDate: new Date('2027-03-31'),
                value: 4100000,
            },
        }),
    ]);
    console.log('Contracts created');
    await Promise.all([
        prisma.workflow.create({
            data: {
                name: 'Relance prospect inactif',
                trigger: 'contact_inactive_30_days',
                action: 'send_email_template_relance',
                active: true,
                runs: 47,
            },
        }),
        prisma.workflow.create({
            data: {
                name: 'Notification ticket haute priorité',
                trigger: 'ticket_created_high_priority',
                action: 'notify_agent_assigned',
                active: true,
                runs: 12,
            },
        }),
        prisma.workflow.create({
            data: {
                name: 'Enquête satisfaction post-ticket',
                trigger: 'ticket_resolved',
                action: 'send_survey_csat',
                active: true,
                runs: 38,
            },
        }),
        prisma.workflow.create({
            data: {
                name: 'Alerte renouvellement contrat',
                trigger: 'contract_expiry_60_days',
                action: 'create_task_renewal',
                active: true,
                runs: 8,
            },
        }),
        prisma.workflow.create({
            data: {
                name: 'Bienvenue nouveau contact',
                trigger: 'contact_created',
                action: 'send_welcome_email',
                active: false,
                runs: 0,
            },
        }),
    ]);
    console.log('Workflows created');
    console.log('Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map