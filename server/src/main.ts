import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'https://nest-generator-client-560247957398.europe-west1.run.app/', // the client
    credentials: false,
  });

  await app.listen(process.env.PORT ?? 5000);
}

void bootstrap();
