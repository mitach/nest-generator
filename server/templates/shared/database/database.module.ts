import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

// <!-- DB_MODULE_IMPORT -->

@Module({
  imports: [
    ConfigModule,
    // <!-- DB_MODULE -->
  ],
})
export class DatabaseModule { }