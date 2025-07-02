import { GenerateProjectData } from '../types/generation.types';

export interface ProjectGeneratorStrategy {
  generateProject(data: GenerateProjectData): Promise<Buffer>;
}
