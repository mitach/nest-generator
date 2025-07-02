import { Injectable } from '@nestjs/common';
import { ProjectGeneratorStrategy } from './project-generator.interface';
import { ProjectBuilderService } from '../services/project-builder.service';
import { MicroserviceProjectData, PendingPartial } from '../types/generation.types';
import * as path from 'path';

@Injectable()
export class MicroserviceStrategy implements ProjectGeneratorStrategy {
  constructor(private readonly builder: ProjectBuilderService) {}

  async generateProject(data: MicroserviceProjectData): Promise<Buffer> {
    const tempDir = this.createTempDir();
    const starterPath = this.getStarterPath();
    let pendingPartials: PendingPartial[] = [];
    const appliedFeaturesMap: Record<string, Set<string>> = {};

    for (const [serviceName, serviceData] of Object.entries(data.services)) {
      pendingPartials = [];
      const serviceDir = path.join(tempDir, serviceName);
      const serviceStarter = path.join(
        starterPath,
        serviceName === 'api-gateway' ? 'api-gateway' : 'service-template',
      );

      await this.builder.copyStarterTemplate(serviceStarter, serviceDir);
      await this.builder.updatePackageJson(serviceDir, serviceName);

      appliedFeaturesMap[serviceName] = new Set();

      for (const feature of serviceData.features) {
        if (appliedFeaturesMap[serviceName].has(feature)) continue;

        await this.builder.applyFeature(
          `${tempDir}/${serviceName}`,
          feature,
          [],
          data.config || {},
          appliedFeaturesMap[serviceName],
          pendingPartials,
          'microservice',
        );
      }

      await this.builder.applyPendingPartials(pendingPartials, appliedFeaturesMap[serviceName]);
    }

    return this.builder.finalizeProject(tempDir);
  }

  private createTempDir(): string {
    return path.join(__dirname, '../../temp', Date.now().toString());
  }

  private getStarterPath(): string {
    return path.join(process.cwd(), 'templates', 'microservice', 'starter');
  }
}
