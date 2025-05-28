import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
// <!-- IMPORTS_PLACEHOLDER -->

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
  const port = parseInt(configService.get<string>('PORT') || '3000', 10);

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // <!-- MIDDLEWARE_PLACEHOLDER -->

  await app.listen(port);
  console.log(`API Gateway is running on port ${port}`);
}

bootstrap();