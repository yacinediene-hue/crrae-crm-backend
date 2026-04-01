import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { DemandesService } from './demandes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('demandes')
export class DemandesController {
  constructor(private service: DemandesService) {}

  @Get()
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
