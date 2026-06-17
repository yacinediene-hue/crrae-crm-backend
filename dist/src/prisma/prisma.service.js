"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super(...arguments);
        this.logger = new common_1.Logger(PrismaService_1.name);
    }
    async onModuleInit() {
        await this.$connect();
        await this.applySchemaFixes();
    }
    async applySchemaFixes() {
        const run = async (sql) => {
            try {
                await this.$executeRawUnsafe(sql);
            }
            catch { }
        };
        await run(`ALTER TABLE "Deal" ALTER COLUMN "contactId"    DROP NOT NULL`);
        await run(`ALTER TABLE "Deal" ALTER COLUMN "title"        DROP NOT NULL`);
        await run(`ALTER TABLE "Deal" ALTER COLUMN "title"        SET DEFAULT ''`);
        await run(`ALTER TABLE "Deal" ALTER COLUMN "value"        DROP NOT NULL`);
        await run(`ALTER TABLE "Deal" ALTER COLUMN "value"        SET DEFAULT 0`);
        await run(`ALTER TABLE "Deal" ALTER COLUMN "probability"  DROP NOT NULL`);
        await run(`ALTER TABLE "Deal" ALTER COLUMN "probability"  SET DEFAULT 0`);
        await run(`UPDATE "Deal" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL`);
        await run(`UPDATE "Deal" SET "nomPrenom" = 'Non renseigné' WHERE "nomPrenom" IS NULL`);
        this.logger.log('Schema fixes applied');
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
//# sourceMappingURL=prisma.service.js.map