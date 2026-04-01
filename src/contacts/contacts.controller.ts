import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from '../audit/audit.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private service: ContactsService, private audit: AuditService) {}

  @Get()
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  @Post('import')
  @Roles('admin', 'manager')
  async importContacts(@Body() contacts: any[], @Request() req: any) {
    const result = await this.service.importContacts(contacts);
    this.audit.log({ auteur: req.user.email, auteurId: req.user.id, action: 'IMPORT_CONTACTS', entite: 'Contact', detail: `Import: ${result.imported} créés, ${result.duplicates} doublons, ${result.errors} erreurs sur ${result.total} lignes` });
    return result;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id')
  @Roles('admin', 'manager')
  async remove(@Param('id') id: string, @Request() req: any) {
    const result = await this.service.remove(id);
    this.audit.log({ auteur: req.user.email, auteurId: req.user.id, action: 'DELETE_CONTACT', entite: 'Contact', entiteId: id });
    return result;
  }
}
