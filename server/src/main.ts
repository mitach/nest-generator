import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000', // the client
    credentials: false,
  });

  await app.listen(process.env.PORT ?? 5000);
}

void bootstrap();
