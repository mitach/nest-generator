import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { GenerateProjectDto } from '../dto/generate-project.dto';
import { GenerationService } from './generation.service';

@Injectable()
export class GeneratorService {
  private readonly logger = new Logger(GeneratorService.name);
  private generations: Map<string, { status: string; project?: any; error?: string }> = new Map();

  constructor(private readonly generationService: GenerationService) {}

  async startGeneration(generateProjectDto: GenerateProjectDto): Promise<string> {
    const generationId = uuidv4();
    this.generations.set(generationId, { status: 'pending' });

    try {
      // Start generation in background
      this.generationService.generateProject(generateProjectDto)
        .then(project => {
          this.generations.set(generationId, { status: 'completed', project });
        })
        .catch(error => {
          this.logger.error(`Generation failed: ${error.message}`, error.stack);
          this.generations.set(generationId, { 
            status: 'failed', 
            error: error.message 
          });
        });

      return generationId;
    } catch (error) {
      this.logger.error(`Failed to start generation: ${error.message}`, error.stack);
      this.generations.set(generationId, { 
        status: 'failed', 
        error: error.message 
      });
      throw error;
    }
  }

  getGenerationStatus(id: string): { status: string; project?: any; error?: string } {
    const generation = this.generations.get(id);
    if (!generation) {
      throw new Error('Generation not found');
    }
    return generation;
  }

  async getGeneratedProject(id: string): Promise<Buffer> {
    const generation = this.generations.get(id);
    if (!generation) {
      throw new Error('Generation not found');
    }
    if (generation.status !== 'completed') {
      throw new Error(`Project not ready for download. Status: ${generation.status}`);
    }
    return generation.project;
  }
} 