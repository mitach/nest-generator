import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { GenerateProjectDto } from '../dto/generate-project.dto';
import { GenerationService } from './generation.service';
import { createErrorResponse, ErrorResponse } from '../../common/errors';
import { GenerationError } from '../../common/errors/generation.errors';

interface GenerationStatus {
  status: 'pending' | 'completed' | 'failed';
  project?: Buffer;
  error?: ErrorResponse;
}

@Injectable()
export class GeneratorService {
  private readonly logger = new Logger(GeneratorService.name);
  private generations: Map<string, GenerationStatus> = new Map();

  constructor(private readonly generationService: GenerationService) {}

  startGeneration(generateProjectDto: GenerateProjectDto): string {
    const generationId = uuidv4();
    this.generations.set(generationId, { status: 'pending' });

    this.logger.log(
      `Starting generation ${generationId} for project: ${generateProjectDto.projectName}`,
    );

    // Start generation in background
    this.generationService
      .generateProject(generateProjectDto)
      .then((project) => {
        this.generations.set(generationId, { status: 'completed', project });
      })
      .catch((error: Error) => {
        const errorResponse = createErrorResponse(error, `/api/generate/${generationId}`);
        this.generations.set(generationId, {
          status: 'failed',
          error: errorResponse,
        });
      });

    return generationId;
  }

  getGenerationStatus(id: string): GenerationStatus {
    const generation = this.generations.get(id);
    if (!generation) {
      throw new GenerationError('Generation not found', 'GENERATION_NOT_FOUND', {
        generationId: id,
      });
    }
    return generation;
  }

  getGeneratedProject(id: string): Buffer {
    const generation = this.generations.get(id);
    if (!generation) {
      throw new GenerationError('Generation not found', 'GENERATION_NOT_FOUND', {
        generationId: id,
      });
    }
    if (generation.status !== 'completed') {
      throw new GenerationError(
        `Project not ready for download. Status: ${generation.status}`,
        'PROJECT_NOT_READY',
        { status: generation.status, generationId: id },
      );
    }
    if (!generation.project) {
      throw new GenerationError('Project data not found', 'PROJECT_DATA_MISSING', {
        generationId: id,
      });
    }
    return generation.project;
  }
}
