import { Injectable } from '@nestjs/common';
import { GenerateProjectDto } from '../dto/generate-project.dto';
import { MonolithStrategy } from '../strategies/monolith.strategy';
import { MicroserviceStrategy } from '../strategies/microservice.strategy';
import { ProjectGeneratorStrategy } from '../strategies/project-generator.interface';

@Injectable()
export class GenerationService {
  constructor(
    private readonly monolithStrategy: MonolithStrategy,
    private readonly microserviceStrategy: MicroserviceStrategy
  ) {}

  async generateProject(data: GenerateProjectDto): Promise<Buffer> {
    const strategy = this.resolveStrategy(data.architecture);

    return strategy.generateProject(data);
  }

  private resolveStrategy(architecture: string): ProjectGeneratorStrategy {
    switch (architecture) {
      case 'microservice':
        return this.microserviceStrategy;
      case 'monolith':
      default:
        return this.monolithStrategy;
    }
  }
}
