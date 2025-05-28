import { Injectable } from '@nestjs/common';
import { ProjectGeneratorStrategy } from './project-generator.interface';
import { ProjectBuilderService } from '../services/project-builder.service';
import * as path from 'path';
import * as fs from 'fs';

interface ServiceDefinition {
  features: string[];
  config?: Record<string, any>;
}

@Injectable()
export class MicroserviceStrategy implements ProjectGeneratorStrategy {
  constructor(private readonly builder: ProjectBuilderService) {}

  // async generateProject(data: any): Promise<Buffer> {
  async generateProject(data: any): Promise<Buffer> {
    const tempDir = this.createTempDir();
    const starterPath = this.getStarterPath();
    let pendingPartials: any[] = [];
    const appliedFeaturesMap: Record<string, Set<string>> = {};

    // await this.builder.copyStarterTemplate(starterPath, tempDir);
    // await this.builder.updatePackageJson(tempDir + '/api-gateway', data.projectName);

    for (const [serviceName, serviceData] of Object.entries(data.services) as [
      string,
      ServiceDefinition,
    ][]) {
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
        // const featurePath = this.getFeaturePath(feature);
        if (appliedFeaturesMap[serviceName].has(feature)) continue;

        await this.builder.applyFeature(
          `${tempDir}/${serviceName}`,
          feature,
          data.config,
          appliedFeaturesMap[serviceName],
          pendingPartials,
          'microservice',
        );
        //     appliedFeaturesMap[serviceName].add(feature);
        //     await this.builder.applyFeatureConfig(
        //       serviceDir,
        //       feature,
        //       featurePath,
        //       serviceData.config || {},
        //       appliedFeaturesMap[serviceName],
        //       pendingPartials
        //     );
      }

      await this.builder.applyPendingPartials(
        pendingPartials,
        appliedFeaturesMap[serviceName],
      );
    }

    return this.builder.finalizeProject(tempDir);
  }

  private createTempDir(): string {
    return path.join(__dirname, '../../temp', Date.now().toString());
  }

  private getStarterPath(): string {
    return path.join(process.cwd(), 'templates', 'microservice', 'starter');
  }

  private getFeaturePath(feature: string): string {
    return path.join(process.cwd(), 'templates', 'features', feature);
  }
}
