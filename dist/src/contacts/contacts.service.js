"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ContactsService = class ContactsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(query) {
        const where = {};
        if (query?.status)
            where.status = query.status;
        if (query?.assignedTo)
            where.assignedTo = query.assignedTo;
        if (query?.profilClient)
            where.profilClient = query.profilClient;
        if (query?.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
                { company: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.contact.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true, name: true, email: true, phone: true, company: true,
                status: true, value: true, lastContact: true, tags: true,
                notes: true, createdAt: true, assignedTo: true, profilClient: true,
            },
        }).catch(() => this.prisma.$queryRaw `
        SELECT id, name, email, phone, company, status, value,
               "lastContact", tags, notes, "createdAt", "assignedTo"
        FROM "Contact" ORDER BY "createdAt" DESC
      `);
    }
    async findOne(id) {
        const contact = await this.prisma.contact.findUnique({
            where: { id },
            include: {
                deals: true,
                activities: true,
                tickets: {
                    include: {
                        surveys: true,
                    },
                },
                contracts: true,
                events: true,
            },
        });
        if (!contact) {
            throw new common_1.NotFoundException(`Contact ${id} introuvable`);
        }
        return contact;
    }
    create(data) {
        const payload = {
            ...data,
            profilClient: data.profilClient || null,
            status: data.status || 'prospect',
        };
        return this.prisma.contact.create({ data: payload });
    }
    async importContacts(contacts) {
        const created = [];
        const duplicates = [];
        const errors = [];
        const skipped = [];
        for (const c of contacts) {
            try {
                const email = (c.email || '').trim().toLowerCase();
                const name = (c.name || '').trim();
                const phone = (c.phone || '').trim();
                const company = (c.company || '').trim();
                const status = (c.status || 'prospect').trim();
                const profilClient = (c.profilClient || c['Profil client'] || c['Profil Client'] || '').trim();
                if (!name && !email && !phone) {
                    skipped.push({ row: c, reason: 'Ligne vide ou incomplète' });
                    continue;
                }
                if (email) {
                    const existing = await this.prisma.contact.findFirst({ where: { email } });
                    if (existing) {
                        duplicates.push({ row: c, reason: 'Email déjà existant' });
                        continue;
                    }
                }
                const contact = await this.prisma.contact.create({
                    data: { name, email, phone, company, status, profilClient },
                });
                created.push(contact);
            }
            catch (e) {
                errors.push({ row: c, reason: 'Erreur lors de la création' });
                console.log('Erreur import contact', c, e);
            }
        }
        return {
            total: contacts.length,
            imported: created.length,
            duplicates: duplicates.length,
            skipped: skipped.length,
            errors: errors.length,
            duplicateRows: duplicates,
            skippedRows: skipped,
            errorRows: errors,
            contacts: created,
        };
    }
    async syncFromDemandes() {
        const n = (v) => {
            const s = String(v || '').trim();
            return s.length > 0 ? s : null;
        };
        const rows = await this.prisma.$queryRaw `
      SELECT "nomPrenom", telephone, email, "typeClient"
      FROM "Demande"
      WHERE (telephone IS NOT NULL AND trim(telephone) != '')
         OR (email    IS NOT NULL AND trim(email)    != '')
    `;
        const seen = new Map();
        for (const d of rows) {
            const email = n(d.email)?.toLowerCase() || null;
            const tel = n(d.telephone);
            const key = email || (tel ? `tel_${tel}` : null);
            if (!key || seen.has(key))
                continue;
            seen.set(key, {
                name: n(d.nomPrenom) || 'Non renseigné',
                email,
                telephone: tel,
                typeClient: n(d.typeClient),
            });
        }
        console.log(`[sync] ${rows.length} demandes lues, ${seen.size} contacts uniques à traiter`);
        let crees = 0, mises_a_jour = 0, ignores = 0;
        const premiereErreur = [];
        for (const [key, d] of seen) {
            try {
                let existing = [];
                if (d.email) {
                    existing = await this.prisma.$queryRaw `
            SELECT id, phone FROM "Contact" WHERE email = ${d.email} LIMIT 1
          `;
                }
                if (existing.length === 0 && d.telephone) {
                    existing = await this.prisma.$queryRaw `
            SELECT id, phone FROM "Contact" WHERE phone = ${d.telephone} LIMIT 1
          `;
                }
                if (existing.length > 0) {
                    await this.prisma.$executeRawUnsafe(`UPDATE "Contact"
             SET name          = $1,
                 email         = COALESCE(email, $2),
                 phone         = COALESCE(phone, $3),
                 "profilClient" = COALESCE("profilClient", $4)
             WHERE id = $5`, d.name, d.email, d.telephone, d.typeClient, existing[0].id);
                    mises_a_jour++;
                }
                else {
                    await this.prisma.$executeRawUnsafe(`INSERT INTO "Contact" (id, name, email, phone, "profilClient", status, value, tags, "createdAt")
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 'client', 0, '{}', NOW())
             ON CONFLICT (email) DO NOTHING`, d.name, d.email, d.telephone, d.typeClient);
                    crees++;
                }
            }
            catch (e) {
                const msg = e?.message || 'Erreur inconnue';
                console.error('[sync] erreur contact', key, msg);
                if (premiereErreur.length < 3)
                    premiereErreur.push(`${key}: ${msg}`);
                ignores++;
            }
        }
        console.log(`[sync] terminé — créés: ${crees}, màj: ${mises_a_jour}, ignorés: ${ignores}`);
        return { crees, mises_a_jour, ignores, total: seen.size, premiereErreur };
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.contact.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.contact.delete({ where: { id } });
    }
    async searchKamagate() {
        const [users, contacts, demandes, deals] = await Promise.all([
            this.prisma.user.findMany({ where: { name: { contains: 'kamagate', mode: 'insensitive' } }, select: { id: true, name: true, email: true } }),
            this.prisma.contact.findMany({ where: { name: { contains: 'kamagate', mode: 'insensitive' } }, select: { id: true, name: true } }),
            this.prisma.demande.findMany({
                where: { OR: [
                        { nomPrenom: { contains: 'kamagate', mode: 'insensitive' } },
                        { agentN1: { contains: 'kamagate', mode: 'insensitive' } },
                        { agentN2: { contains: 'kamagate', mode: 'insensitive' } },
                    ] },
                select: { id: true, numDemande: true, nomPrenom: true, agentN1: true, agentN2: true },
            }),
            this.prisma.deal.findMany({
                where: { OR: [
                        { nomPrenom: { contains: 'kamagate', mode: 'insensitive' } },
                        { agentResponsable: { contains: 'kamagate', mode: 'insensitive' } },
                    ] },
                select: { id: true, nomPrenom: true, agentResponsable: true },
            }),
        ]);
        return { users, contacts, demandes, deals };
    }
    uniformiserKamagate(valeur) {
        if (!valeur)
            return null;
        const corrige = valeur
            .replace(/\bfatou\s+kamagate\b/gi, 'KAMAGATE Fatoumata')
            .replace(/\bkamagate\s+fatou\b/gi, 'KAMAGATE Fatoumata');
        return corrige !== valeur ? corrige : null;
    }
    async migrerNomKamagate() {
        const rapport = [];
        let total = 0;
        const users = await this.prisma.user.findMany({ where: { name: { contains: 'kamagate', mode: 'insensitive' } } });
        for (const u of users) {
            const corrige = this.uniformiserKamagate(u.name);
            if (corrige) {
                await this.prisma.user.update({ where: { id: u.id }, data: { name: corrige } });
                rapport.push({ table: 'User', champ: 'name', avant: u.name, apres: corrige });
                total++;
            }
        }
        const contacts = await this.prisma.contact.findMany({ where: { name: { contains: 'kamagate', mode: 'insensitive' } } });
        for (const c of contacts) {
            const corrige = this.uniformiserKamagate(c.name);
            if (corrige) {
                await this.prisma.contact.update({ where: { id: c.id }, data: { name: corrige } });
                rapport.push({ table: 'Contact', champ: 'name', avant: c.name, apres: corrige });
                total++;
            }
        }
        const demandes = await this.prisma.demande.findMany({
            where: { OR: [
                    { nomPrenom: { contains: 'kamagate', mode: 'insensitive' } },
                    { agentN1: { contains: 'kamagate', mode: 'insensitive' } },
                    { agentN2: { contains: 'kamagate', mode: 'insensitive' } },
                ] },
        });
        for (const d of demandes) {
            const data = {};
            const npCorrige = this.uniformiserKamagate(d.nomPrenom);
            const a1Corrige = this.uniformiserKamagate(d.agentN1);
            const a2Corrige = this.uniformiserKamagate(d.agentN2);
            if (npCorrige) {
                data.nomPrenom = npCorrige;
                rapport.push({ table: 'Demande', champ: 'nomPrenom', id: d.numDemande, avant: d.nomPrenom, apres: npCorrige });
                total++;
            }
            if (a1Corrige) {
                data.agentN1 = a1Corrige;
                rapport.push({ table: 'Demande', champ: 'agentN1', id: d.numDemande, avant: d.agentN1, apres: a1Corrige });
                total++;
            }
            if (a2Corrige) {
                data.agentN2 = a2Corrige;
                rapport.push({ table: 'Demande', champ: 'agentN2', id: d.numDemande, avant: d.agentN2, apres: a2Corrige });
                total++;
            }
            if (Object.keys(data).length > 0)
                await this.prisma.demande.update({ where: { id: d.id }, data });
        }
        const deals = await this.prisma.deal.findMany({
            where: { OR: [
                    { nomPrenom: { contains: 'kamagate', mode: 'insensitive' } },
                    { agentResponsable: { contains: 'kamagate', mode: 'insensitive' } },
                ] },
        });
        for (const d of deals) {
            const data = {};
            const npCorrige = this.uniformiserKamagate(d.nomPrenom);
            const arCorrige = this.uniformiserKamagate(d.agentResponsable);
            if (npCorrige) {
                data.nomPrenom = npCorrige;
                rapport.push({ table: 'Deal', champ: 'nomPrenom', id: d.id, avant: d.nomPrenom, apres: npCorrige });
                total++;
            }
            if (arCorrige) {
                data.agentResponsable = arCorrige;
                rapport.push({ table: 'Deal', champ: 'agentResponsable', id: d.id, avant: d.agentResponsable, apres: arCorrige });
                total++;
            }
            if (Object.keys(data).length > 0)
                await this.prisma.deal.update({ where: { id: d.id }, data });
        }
        return { cible: 'KAMAGATE Fatoumata', rapport, total };
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map