import { Module } from '@nestjs/common';
import { GeneratorController } from './controllers/generator.controller';
import { GeneratorService } from './services/generator.service';
import { GenerationService } from './services/generation.service';
import { MonolithStrategy } from './strategies/monolith.strategy';
import { ProjectBuilderService } from './services/project-builder.service';
import { MicroserviceStrategy } from './strategies/microservice.strategy';
import { HandlebarsTemplateService } from './services/handlebars-template.service';
import { DependencyResolverService } from './services/dependency-resolver.service';

@Module({
  controllers: [GeneratorController],
  providers: [
    GeneratorService,
    GenerationService,
    MonolithStrategy,
    MicroserviceStrategy,
    ProjectBuilderService,
    HandlebarsTemplateService,
    DependencyResolverService,
  ],
  exports: [
    GeneratorService,
    GenerationService,
    HandlebarsTemplateService,
    DependencyResolverService,
  ],
})
export class GeneratorModule {}
