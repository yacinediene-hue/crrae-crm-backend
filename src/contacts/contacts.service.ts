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
    return this.prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' } });
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

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.contact.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contact.delete({ where: { id } });
  }
}
