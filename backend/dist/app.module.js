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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const initial_seeder_1 = require("./infrastructure/database/seeders/initial.seeder");
const message_module_1 = require("./message.module");
const auth_module_1 = require("./auth.module");
const client_module_1 = require("./client.module");
const admin_module_1 = require("./admin.module");
const pricing_module_1 = require("./pricing.module");
let AppModule = class AppModule {
    initialSeeder;
    constructor(initialSeeder) {
        this.initialSeeder = initialSeeder;
    }
    async onModuleInit() {
        if (process.env.RUN_SEEDER === 'true') {
            await this.initialSeeder.seed();
        }
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DB_HOST', 'localhost'),
                    port: config.get('DB_PORT', 5432),
                    username: config.get('DB_USER', 'bcb_user'),
                    password: config.get('DB_PASSWORD', 'bcb_password'),
                    database: config.get('DB_NAME', 'bcb_db'),
                    autoLoadEntities: true,
                    synchronize: true,
                }),
            }),
            auth_module_1.AuthModule,
            client_module_1.ClientModule,
            pricing_module_1.PricingModule,
            admin_module_1.AdminModule,
            message_module_1.MessageModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, initial_seeder_1.InitialSeeder],
    }),
    __metadata("design:paramtypes", [initial_seeder_1.InitialSeeder])
], AppModule);
//# sourceMappingURL=app.module.js.map