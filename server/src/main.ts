import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000', // for local development
      process.env.FRONTEND_URL || 'https://nest-generator-client-560247957398.europe-west1.run.app', // production frontend URL
    ],
    credentials: false,
  });

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on port ${port}`);
}
bootstrap();
