import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// <!-- MODULE_IMPORTS -->

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // <!-- MODULES -->
  ],
  controllers: [
    AppController,
    // <!-- CONTROLLERS -->
  ],
  providers: [
    AppService,
    // <!-- PROVIDERS -->
  ],
})
export class AppModule {}
