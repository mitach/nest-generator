import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import { promisify } from 'util';
import { exec } from 'child_process';
import { HandlebarsTemplateService } from './handlebars-template.service';
import { PendingPartial, PartialFileMeta } from '../types/generation.types';
import { DependencyResolverService } from './dependency-resolver.service';
import {
  FeatureNotFoundError,
  FileSystemError,
  TemplateError,
} from '../../common/errors/generation.errors';

interface FeatureConfig {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  copyFiles?: Array<{ source: string; target: string; processTemplate?: boolean }>;
  updateAppModule?: boolean;
  partialFiles?: Record<string, PartialFileMeta>;
}

const execAsync = promisify(exec);

@Injectable()
export class ProjectBuilderService {
  private readonly logger = new Logger(ProjectBuilderService.name);
  private readonly templatesPath = path.join(process.cwd(), 'templates');

  constructor(
    private readonly templateService: HandlebarsTemplateService,
    private readonly dependencyResolver: DependencyResolverService,
  ) {}

  public async copyStarterTemplate(source: string, destination: string): Promise<void> {
    await this.copyDirectory(source, destination);
  }

  public async updatePackageJson(projectPath: string, projectName: string): Promise<void> {
    const pkgPath = path.join(projectPath, 'package.json');
    const pkg = JSON.parse(await fs.promises.readFile(pkgPath, 'utf8')) as Record<string, unknown>;
    pkg.name = projectName;
    await fs.promises.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
  }

  public async applyFeature(
    tempDir: string,
    feature: string,
    allFeatures: string[],
    config: Record<string, unknown>,
    appliedFeatures: Set<string>,
    pendingPartials: PendingPartial[],
    architecture: 'monolith' | 'microservice',
  ): Promise<void> {
    const featureParts = feature.split(':');
    let cumulativeFeature = '';

    for (const part of featureParts) {
      cumulativeFeature = cumulativeFeature ? `${cumulativeFeature}:${part}` : part;

      if (appliedFeatures.has(cumulativeFeature)) {
        continue;
      }

      const fullFeaturePath = await this.resolveFeaturePath(cumulativeFeature, architecture);

      await this.applyFeatureConfig(
        tempDir,
        cumulativeFeature,
        fullFeaturePath,
        allFeatures,
        config,
        appliedFeatures,
        pendingPartials,
        architecture,
      );

      appliedFeatures.add(cumulativeFeature);
    }
  }

  public async applyFeatureConfig(
    tempDir: string,
    featureName: string,
    featurePath: string,
    allFeatures: string[],
    config: Record<string, unknown>,
    appliedFeatures: Set<string>,
    pendingPartials: PendingPartial[],
    architecture: 'monolith' | 'microservice',
  ): Promise<void> {
    const featureConfigPath = path.join(featurePath, 'feature.config.json');

    if (!fs.existsSync(featureConfigPath)) {
      this.logger.warn(`No feature config found for ${featureName} at ${featureConfigPath}`);
      return;
    }

    try {
      const featureConfig = JSON.parse(
        await fs.promises.readFile(featureConfigPath, 'utf8'),
      ) as FeatureConfig;

      this.logger.log(`Applying feature: ${featureName}`);

      // Install dependencies
      await this.mergeDependencies(tempDir, featureConfig);

      // Copy files
      if (featureConfig.copyFiles) {
        for (const file of featureConfig.copyFiles) {
          const src = path.join(featurePath, file.source);
          const dest = path.join(tempDir, file.target);

          if (!fs.existsSync(src)) {
            throw new FileSystemError(`Source file not found: ${file.source}`, src, {
              featureName,
              fileConfig: file,
            });
          }

          if (file.processTemplate) {
            try {
              await this.templateService.processTemplateFile(
                src,
                dest,
                allFeatures,
                config[featureName] || config[featureName.split(':')[0]] || {},
                featureName,
                tempDir,
              );
            } catch (error) {
              throw new TemplateError(`Failed to process template: ${file.source}`, src, {
                featureName,
                originalError: error.message,
              });
            }
          } else {
            await this.copyFile(src, dest);
          }
        }
      }

      if (featureConfig.updateAppModule) {
        await this.updateAppModule(tempDir, featureName);
      }

      // Defer partials
      if (featureConfig.partialFiles) {
        const featureConfigForPartials = (config[featureName] ||
          config[featureName.split(':')[0]] ||
          {}) as Record<string, unknown>;
        pendingPartials.push({
          tempDir,
          featurePath,
          partialFiles: featureConfig.partialFiles,
          featureName,
          architecture,
          config: featureConfigForPartials,
          allFeatures,
        });
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new TemplateError(
          `Invalid JSON in feature config: ${featureName}`,
          featureConfigPath,
          { originalError: error.message },
        );
      }
      throw error;
    }
  }

  public async applyPendingPartials(
    pendingPartials: PendingPartial[],
    appliedFeatures: Set<string>,
  ): Promise<void> {
    for (const {
      tempDir,
      featurePath,
      partialFiles,
      featureName,
      config: featureConfig,
      allFeatures,
    } of pendingPartials) {
      for (const [, partialConfig] of Object.entries(partialFiles)) {
        if (partialConfig.onlyIfFeatures) {
          const allPresent = partialConfig.onlyIfFeatures.every((reqFeature: string) =>
            appliedFeatures.has(reqFeature),
          );
          if (!allPresent) continue;
        }

        const targetPath = path.join(tempDir, partialConfig.target);
        const partialPath = path.join(featurePath, partialConfig.source);
        if (!fs.existsSync(targetPath) || !fs.existsSync(partialPath)) continue;

        let targetContent = await fs.promises.readFile(targetPath, 'utf-8');
        let partialContent = await fs.promises.readFile(partialPath, 'utf-8');

        // Process partial with Handlebars
        partialContent = this.templateService.processTemplate(
          partialContent,
          allFeatures,
          featureConfig,
          featureName,
          tempDir,
        );

        for (let i = 0; i < partialConfig.placeholders.length; i++) {
          const current = partialConfig.placeholders[i];
          const next = partialConfig.placeholders[i + 1];
          const marker = `// <!-- ${current} -->`;

          const contentToInsert = this.extractFromTo(partialContent, current, next);
          if (!contentToInsert) continue;

          const insertion = `${marker}\n${contentToInsert.trim()}`;
          targetContent = targetContent.replace(marker, insertion);
        }

        await fs.promises.writeFile(targetPath, targetContent);
      }
    }
  }

  public async finalizeProject(tempDir: string): Promise<Buffer> {
    await this.removePlaceholderComments(tempDir);
    await execAsync(`npx prettier "**/*.{ts,js,json,md}" --write`, {
      cwd: tempDir,
    });
    const zip = await this.createZip(tempDir);
    await fs.promises.rm(tempDir, { recursive: true, force: true });
    return zip;
  }

  public async createZip(directory: string): Promise<Buffer> {
    const zipPath = path.join(directory, '../project.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        void (async () => {
          try {
            const buffer = await fs.promises.readFile(zipPath);
            resolve(buffer);
          } catch (error) {
            reject(
              new Error(
                `Failed to read zip file: ${error instanceof Error ? error.message : 'Unknown error'}`,
              ),
            );
          }
        })();
      });

      archive.on('error', (err: Error) => reject(err));

      archive.pipe(output);
      archive.directory(directory, false);
      void archive.finalize();
    });
  }

  private extractFromTo(content: string, start: string, end?: string): string | null {
    const startRegex = new RegExp(`//\\s*<!--\\s*${start}\\s*-->`, 'g');
    const endRegex = end ? new RegExp(`//\\s*<!--\\s*${end}\\s*-->`, 'g') : null;

    const startMatch = startRegex.exec(content);
    if (!startMatch) return null;

    const startIndex = startMatch.index + startMatch[0].length;

    let endIndex = content.length;
    if (endRegex) {
      endRegex.lastIndex = startIndex;
      const endMatch = endRegex.exec(content);
      if (endMatch) {
        endIndex = endMatch.index;
      }
    }

    return content.slice(startIndex, endIndex).trim();
  }

  private async updateAppModule(tempDir: string, feature: string): Promise<void> {
    console.log('updateAppModule');
    const appModulePath = path.join(tempDir, 'src/app.module.ts');
    const appModuleContent = await fs.promises.readFile(appModulePath, 'utf-8');

    // Add import statement with correct path
    const importStatement = `import { ${this.capitalizeFirstLetter(feature)}Module } from './${feature}/${feature}.module';`;
    const updatedContent = appModuleContent.replace(/import.*?;/, `$&\n${importStatement}`);

    // Add module to imports array
    const moduleName = `${this.capitalizeFirstLetter(feature)}Module`;
    const updatedImports = updatedContent.replace(
      /@Module\({[\s\S]*?imports:\s*\[([\s\S]*?)\]/,
      `@Module({\n  imports: [\n$1    ${moduleName},  ]`,
    );

    await fs.promises.writeFile(appModulePath, updatedImports);
  }

  private async copyFile(src: string, dest: string): Promise<void> {
    try {
      await fs.promises.mkdir(path.dirname(dest), { recursive: true });
      await fs.promises.copyFile(src, dest);
    } catch (error) {
      throw new FileSystemError(`Failed to copy file from ${src} to ${dest}`, dest, {
        originalError: error.message,
      });
    }
  }

  private async copyDirectory(src: string, dest: string): Promise<void> {
    await fs.promises.mkdir(dest, { recursive: true });
    const entries = await fs.promises.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await this.copyFile(srcPath, destPath);
      }
    }
  }

  private async removePlaceholderComments(dir: string): Promise<void> {
    const fileExtensions = ['.ts', '.js', '.json', '.env'];

    const walk = async (dirPath: string): Promise<string[]> => {
      const entries = await fs.promises.readdir(dirPath, {
        withFileTypes: true,
      });
      const files: string[] = [];

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          files.push(...(await walk(fullPath)));
        } else if (fileExtensions.some((ext) => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }

      return files;
    };

    const filesToClean = await walk(dir);

    const markerRegex = /[ \t]*\/\/\s*<!--.*?-->\s*\n?/g;

    for (const filePath of filesToClean) {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const cleaned = content.replace(markerRegex, '');
      await fs.promises.writeFile(filePath, cleaned);
    }
  }

  private async mergeDependencies(tempDir: string, config: FeatureConfig): Promise<void> {
    const pkgPath = path.join(tempDir, 'package.json');
    const pkg = JSON.parse(await fs.promises.readFile(pkgPath, 'utf8')) as Record<string, unknown>;

    const resolved = this.dependencyResolver.resolveDependencies(config);

    if (Object.keys(resolved.dependencies).length > 0) {
      const deps = (pkg.dependencies as Record<string, string>) || {};
      pkg.dependencies = {
        ...deps,
        ...resolved.dependencies,
      };
    }

    if (Object.keys(resolved.devDependencies).length > 0) {
      const devDeps = (pkg.devDependencies as Record<string, string>) || {};
      pkg.devDependencies = {
        ...devDeps,
        ...resolved.devDependencies,
      };
    }

    await fs.promises.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
  }

  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  private async resolveFeaturePath(
    feature: string,
    architecture: 'monolith' | 'microservice',
  ): Promise<string> {
    const relativePath = path.join(...feature.split(':'));

    const sharedPath = path.join(this.templatesPath, 'shared', relativePath);
    const archPath = path.join(this.templatesPath, architecture, 'modules', relativePath);

    if (await this.pathExists(sharedPath)) {
      return sharedPath;
    }

    if (await this.pathExists(archPath)) {
      return archPath;
    }

    throw new FeatureNotFoundError(feature, architecture);
  }

  private async pathExists(p: string): Promise<boolean> {
    try {
      await fs.promises.access(p);
      return true;
    } catch {
      return false;
    }
  }
}
