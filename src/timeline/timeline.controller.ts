import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('timeline')
export class TimelineController {
  constructor(private service: TimelineService) {}

  @Get('demande/:demandeId')
  findByDemande(@Param('demandeId') demandeId: string) {
    return this.service.findByDemande(demandeId);
  }

  @Post()
  create(@Body() body: any) { return this.service.create(body); }
}
