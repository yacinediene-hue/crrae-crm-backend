import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ContactsModule } from './contacts/contacts.module';
import { DealsModule } from './deals/deals.module';
import { ActivitiesModule } from './activities/activities.module';
import { TicketsModule } from './tickets/tickets.module';
import { SurveysModule } from './surveys/surveys.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { EventsModule } from './events/events.module';
import { ContractsModule } from './contracts/contracts.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { UsersModule } from './users/users.module';
import { DemandesModule } from './demandes/demandes.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ContactsModule,
    DealsModule,
    ActivitiesModule,
    TicketsModule,
    SurveysModule,
    CampaignsModule,
    EventsModule,
    ContractsModule,
    WorkflowsModule,
    UsersModule,
    DemandesModule,
  ],
})
export class AppModule {}
