import { Injectable } from '@nestjs/common';
import { ProjectGeneratorStrategy } from './project-generator.interface';
import { ProjectBuilderService } from '../services/project-builder.service';
import * as path from 'path';

@Injectable()
export class MonolithStrategy implements ProjectGeneratorStrategy {
  constructor(private readonly builder: ProjectBuilderService) {}

  async generateProject(data: any): Promise<Buffer> {
    const tempDir = this.createTempDir();
    const starterPath = this.getStarterPath();
    const pendingPartials: any[] = [];
    const appliedFeatures = new Set<string>();

    await this.builder.copyStarterTemplate(starterPath, tempDir);
    await this.builder.updatePackageJson(tempDir, data.projectName);
    
    for (const feature of data.features) {
      await this.builder.applyFeature(tempDir, feature, data.config, appliedFeatures, pendingPartials, 'monolith');
    }

    await this.builder.applyPendingPartials(pendingPartials, appliedFeatures);
    return this.builder.finalizeProject(tempDir);
  }

  private createTempDir(): string {
    return path.join(__dirname, '../../temp', Date.now().toString());
  }

  private getStarterPath(): string {
    return path.join(process.cwd(), 'templates', 'monolith', 'starter');
  }

  private getFeaturePath(feature: string): string {
    return path.join(process.cwd(), 'templates', 'features', feature);
  }
}
