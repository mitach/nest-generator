import { Module } from '@nestjs/common';
import { GeneratorController } from './controllers/generator.controller';
import { GeneratorService } from './services/generator.service';
import { GenerationService } from './services/generation.service';
import { MonolithStrategy } from './strategies/monolith.strategy';
import { ProjectBuilderService } from './services/project-builder.service';
import { MicroserviceStrategy } from './strategies/microservice.strategy';

@Module({
  controllers: [GeneratorController],
  providers: [GeneratorService, GenerationService, MonolithStrategy, MicroserviceStrategy, ProjectBuilderService],
  exports: [GeneratorService, GenerationService],
})
export class GeneratorModule {} 