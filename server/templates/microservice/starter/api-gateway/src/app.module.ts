import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
// <!-- MODULE_IMPORTS -->

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      // <!-- CLIENTS_MODULE_REGISTER -->
    ]),
  ],
  controllers: [
    // <!-- MODULE_CONTROLLERS -->
  ],
})
export class AppModule {}