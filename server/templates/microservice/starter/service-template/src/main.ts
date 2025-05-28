import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
// <!-- IMPORTS_PLACEHOLDER -->

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: new ConfigService().get('PORT'),
    },
  });

  // <!-- MIDDLEWARE_PLACEHOLDER -->

  await app.listen();
  console.log(`microservice is listening on port ${new ConfigService().get('PORT')}`);
}

bootstrap();
