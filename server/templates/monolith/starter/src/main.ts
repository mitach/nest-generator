import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// <!-- IMPORTS_PLACEHOLDER -->

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // <!-- MIDDLEWARE_PLACEHOLDER -->

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
