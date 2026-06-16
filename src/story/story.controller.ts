import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { StoryService } from './story.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('story')
export class StoryController {
  constructor(private service: StoryService) {}

  @Post()
  @Roles('admin', 'manager', 'agent')
  generate(@Body() body: any) {
    return this.service.generateReport(body);
  }
}
