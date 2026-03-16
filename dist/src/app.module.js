"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const contacts_module_1 = require("./contacts/contacts.module");
const deals_module_1 = require("./deals/deals.module");
const activities_module_1 = require("./activities/activities.module");
const tickets_module_1 = require("./tickets/tickets.module");
const surveys_module_1 = require("./surveys/surveys.module");
const campaigns_module_1 = require("./campaigns/campaigns.module");
const events_module_1 = require("./events/events.module");
const contracts_module_1 = require("./contracts/contracts.module");
const workflows_module_1 = require("./workflows/workflows.module");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            contacts_module_1.ContactsModule,
            deals_module_1.DealsModule,
            activities_module_1.ActivitiesModule,
            tickets_module_1.TicketsModule,
            surveys_module_1.SurveysModule,
            campaigns_module_1.CampaignsModule,
            events_module_1.EventsModule,
            contracts_module_1.ContractsModule,
            workflows_module_1.WorkflowsModule,
            users_module_1.UsersModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map