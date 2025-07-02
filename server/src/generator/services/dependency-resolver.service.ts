import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { FeatureConfig } from '../types/generation.types';

interface DependencyRegistry {
  metadata: {
    version: string;
    lastUpdated: string;
  };
  dependencies: Record<string, Record<string, string>>;
  devDependencies: Record<string, Record<string, string>>;
  presets: Record<
    string,
    {
      extends?: string;
      includes: string[];
      devIncludes?: string[];
    }
  >;
}

@Injectable()
export class DependencyResolverService {
  private readonly logger = new Logger(DependencyResolverService.name);
  private registry: DependencyRegistry | null = null;
  private readonly registryPath = path.join(process.cwd(), 'templates', 'dependency-registry.json');

  constructor() {
    this.loadRegistry();
  }

  resolveDependencies(featureConfig: FeatureConfig): {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  } {
    if (!this.registry) {
      throw new Error('Dependency registry not loaded');
    }

    const resolvedDeps: Record<string, string> = {};
    const resolvedDevDeps: Record<string, string> = {};

    if (featureConfig.dependencyPresets) {
      for (const presetName of featureConfig.dependencyPresets) {
        const preset = this.registry.presets[presetName];
        if (!preset) {
          this.logger.warn(`Unknown preset: ${presetName}`);
          continue;
        }

        if (preset.extends) {
          const extendedDeps = this.resolvePreset(preset.extends);
          Object.assign(resolvedDeps, extendedDeps.dependencies);
          Object.assign(resolvedDevDeps, extendedDeps.devDependencies);
        }

        const presetDeps = this.resolveIncludes(preset.includes);
        Object.assign(resolvedDeps, presetDeps);

        if (preset.devIncludes) {
          const presetDevDeps = this.resolveDevIncludes(preset.devIncludes);
          Object.assign(resolvedDevDeps, presetDevDeps);
        }
      }
    }

    if (featureConfig.dependencyGroups) {
      for (const groupName of featureConfig.dependencyGroups) {
        const group = this.registry.dependencies[groupName];
        if (group) {
          Object.assign(resolvedDeps, group);
        } else {
          this.logger.warn(`Unknown dependency group: ${groupName}`);
        }

        const devGroup = this.registry.devDependencies[groupName];
        if (devGroup) {
          Object.assign(resolvedDevDeps, devGroup);
        }
      }
    }

    if (featureConfig.customDependencies) {
      Object.assign(resolvedDeps, featureConfig.customDependencies);
    }

    if (featureConfig.customDevDependencies) {
      Object.assign(resolvedDevDeps, featureConfig.customDevDependencies);
    }

    return {
      dependencies: resolvedDeps,
      devDependencies: resolvedDevDeps,
    };
  }

  private loadRegistry(): void {
    try {
      const registryContent = fs.readFileSync(this.registryPath, 'utf-8');
      this.registry = JSON.parse(registryContent);
    } catch (error) {
      this.logger.error('Failed to load dependency registry:', error);
      throw new Error('Dependency registry is required for project generation');
    }
  }

  private resolvePreset(presetName: string): {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  } {
    const preset = this.registry!.presets[presetName];
    if (!preset) {
      return { dependencies: {}, devDependencies: {} };
    }

    const dependencies = this.resolveIncludes(preset.includes);
    const devDependencies = preset.devIncludes ? this.resolveDevIncludes(preset.devIncludes) : {};

    return { dependencies, devDependencies };
  }

  private resolveIncludes(includes: string[]): Record<string, string> {
    const resolved: Record<string, string> = {};

    for (const include of includes) {
      const [groupName, packageName] = include.split('.');
      const group = this.registry!.dependencies[groupName];

      if (group && group[packageName]) {
        resolved[packageName] = group[packageName];
      } else {
        this.logger.warn(`Could not resolve: ${include}`);
      }
    }

    return resolved;
  }

  private resolveDevIncludes(devIncludes: string[]): Record<string, string> {
    const resolved: Record<string, string> = {};

    for (const include of devIncludes) {
      const [groupName, packageName] = include.split('.');
      const group = this.registry!.devDependencies[groupName];

      if (group && group[packageName]) {
        resolved[packageName] = group[packageName];
      } else {
        this.logger.warn(`Could not resolve dev dependency: ${include}`);
      }
    }

    return resolved;
  }
}
