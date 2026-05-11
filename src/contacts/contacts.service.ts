import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  findAll(query?: any) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.assignedTo) where.assignedTo = query.assignedTo;
    if (query?.profilClient) where.profilClient = query.profilClient;
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
    }).catch(() =>
      this.prisma.$queryRaw`
        SELECT id, name, email, phone, company, status, value,
               "lastContact", tags, notes, "createdAt", "assignedTo"
        FROM "Contact" ORDER BY "createdAt" DESC
      `
    );
  }

  async findOne(id: string) {
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
      throw new NotFoundException(`Contact ${id} introuvable`);
    }

    return contact;
  }

  create(data: any) {
    const payload = {
      ...data,
      profilClient: data.profilClient || null,
      status: data.status || 'prospect',
    };

    return this.prisma.contact.create({ data: payload });
  }

  async importContacts(contacts: any[]) {
    const created: any[] = [];
    const duplicates: any[] = [];
    const errors: any[] = [];
    const skipped: any[] = [];

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
      } catch (e) {
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
    const n = (v: any): string | null => {
      const s = String(v || '').trim();
      return s.length > 0 ? s : null;
    };

    const rows: any[] = await this.prisma.$queryRaw`
      SELECT "nomPrenom", telephone, email, "typeClient"
      FROM "Demande"
      WHERE (telephone IS NOT NULL AND trim(telephone) != '')
         OR (email    IS NOT NULL AND trim(email)    != '')
    `;

    // Dédoublonnage : clé = email (priorité) ou téléphone
    const seen = new Map<string, any>();
    for (const d of rows) {
      const email = n(d.email)?.toLowerCase() || null;
      const tel   = n(d.telephone);
      const key   = email || (tel ? `tel_${tel}` : null);
      if (!key || seen.has(key)) continue;
      seen.set(key, {
        name:      n(d.nomPrenom) || 'Non renseigné',
        email,           // null si absent — pas de faux email
        telephone: tel,  // null si absent
        typeClient: n(d.typeClient),
      });
    }

    console.log(`[sync] ${rows.length} demandes lues, ${seen.size} contacts uniques à traiter`);

    let crees = 0, mises_a_jour = 0, ignores = 0;
    const premiereErreur: string[] = [];

    for (const [key, d] of seen) {
      try {
        let existing: any[] = [];
        if (d.email) {
          existing = await this.prisma.$queryRaw`
            SELECT id, phone FROM "Contact" WHERE email = ${d.email} LIMIT 1
          `;
        }
        if (existing.length === 0 && d.telephone) {
          existing = await this.prisma.$queryRaw`
            SELECT id, phone FROM "Contact" WHERE phone = ${d.telephone} LIMIT 1
          `;
        }

        if (existing.length > 0) {
          await this.prisma.$executeRaw`
            UPDATE "Contact"
            SET name  = ${d.name},
                email = COALESCE(email, ${d.email}),
                phone = COALESCE(phone, ${d.telephone})
            WHERE id = ${existing[0].id}
          `;
          mises_a_jour++;
        } else {
          await this.prisma.$executeRaw`
            INSERT INTO "Contact" (id, name, email, phone, status, value, tags, "createdAt")
            VALUES (gen_random_uuid()::text, ${d.name}, ${d.email}, ${d.telephone}, 'client', 0, ARRAY[]::TEXT[], NOW())
          `;
          crees++;
        }
      } catch (e: any) {
        const msg = e?.message || 'Erreur inconnue';
        console.error('[sync] erreur contact', key, msg);
        if (premiereErreur.length < 3) premiereErreur.push(`${key}: ${msg}`);
        ignores++;
      }
    }

    console.log(`[sync] terminé — créés: ${crees}, màj: ${mises_a_jour}, ignorés: ${ignores}`);
    return { crees, mises_a_jour, ignores, total: seen.size, premiereErreur };
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.contact.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contact.delete({ where: { id } });
  }
}
