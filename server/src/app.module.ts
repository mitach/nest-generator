import { Module } from '@nestjs/common';
import { GeneratorModule } from './generator/generator.module';
import { ConfigModule } from '@nestjs/config';
import { FeaturesModule } from './features/features.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GeneratorModule,
    FeaturesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
