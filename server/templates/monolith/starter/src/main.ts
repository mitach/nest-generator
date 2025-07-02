import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './setupApp';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    setupApp(app);

    await app.listen(process.env.PORT ?? 8080);
}

bootstrap();
