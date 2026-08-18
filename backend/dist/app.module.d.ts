import { OnModuleInit } from '@nestjs/common';
import { InitialSeeder } from './infrastructure/database/seeders/initial.seeder';
export declare class AppModule implements OnModuleInit {
    private readonly initialSeeder;
    constructor(initialSeeder: InitialSeeder);
    onModuleInit(): Promise<void>;
}
