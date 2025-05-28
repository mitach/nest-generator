import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import { promisify } from 'util';
import { exec } from 'child_process';

interface PartialFileMeta {
  target: string;
  source: string;
  placeholders: string[];
  onlyIfFeatures: string[];
}

const execAsync = promisify(exec);

@Injectable()
export class ProjectBuilderService {
  private featureLocationCache: Record<
    string,
    'shared' | 'monolith' | 'microservice'
  > = {};

  private readonly logger = new Logger(ProjectBuilderService.name);
  private readonly templatesPath = path.join(process.cwd(), 'templates');
  private readonly featuresPath = path.join(this.templatesPath, 'features');

  public async copyStarterTemplate(
    source: string,
    destination: string,
  ): Promise<void> {
    await this.copyDirectory(source, destination);
  }

  public async updatePackageJson(
    projectPath: string,
    projectName: string,
  ): Promise<void> {
    const pkgPath = path.join(projectPath, 'package.json');
    const pkg = JSON.parse(await fs.promises.readFile(pkgPath, 'utf8'));
    pkg.name = projectName;
    await fs.promises.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
  }

  //   public async applyFeature(
  //     tempDir: string,
  //     feature: string,
  //     config: any,
  //     appliedFeatures: Set<string>,
  //     pendingPartials: any[],
  //     architecture: 'monolith' | 'microservice',
  //   ) {
  //     const parts = feature.split(':');
  //     let cumulativePath = '';
  //     let relativePath = '';

  //     for (let i = 0; i < parts.length; i++) {
  //       const part = parts[i];
  //       cumulativePath = cumulativePath ? `${cumulativePath}:${part}` : part;
  //       relativePath = path.join(relativePath, part);
  //       console.log('cumulativePath', cumulativePath);
  //       if (!appliedFeatures.has(cumulativePath)) {
  //         // const fullFeaturePath = path.join(this.featuresPath, relativePath);
  //         const fullFeaturePath = await this.resolveFeaturePath(
  //           cumulativePath,
  //           architecture,
  //         );
  //         console.log('fullFeaturePath', fullFeaturePath);

  //         await this.applyFeatureConfig(
  //           tempDir,
  //           cumulativePath,
  //           fullFeaturePath,
  //           config,
  //           appliedFeatures,
  //           pendingPartials,
  //           architecture,
  //         );

  //         appliedFeatures.add(cumulativePath);
  //       }
  //     }
  //   }

  public async applyFeature(
    tempDir: string,
    feature: string,
    config: any,
    appliedFeatures: Set<string>,
    pendingPartials: any[],
    architecture: 'monolith' | 'microservice',
  ): Promise<void> {
    const featureParts = feature.split(':');
    let cumulativeFeature = '';

    for (const part of featureParts) {
      cumulativeFeature = cumulativeFeature
        ? `${cumulativeFeature}:${part}`
        : part;

      if (appliedFeatures.has(cumulativeFeature)) {
        continue;
      }

      const fullFeaturePath = await this.resolveFeaturePath(
        cumulativeFeature,
        architecture,
      );

      await this.applyFeatureConfig(
        tempDir,
        cumulativeFeature,
        fullFeaturePath,
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
    config: any,
    appliedFeatures: Set<string>,
    pendingPartials: any[],
    architecture: 'monolith' | 'microservice',
  ): Promise<void> {
    console.log('-> applyFeatureConfig');

    const configPath = path.join(featurePath, 'feature.config.json');

    if (!fs.existsSync(configPath)) return;

    const featureConfig = JSON.parse(
      await fs.promises.readFile(configPath, 'utf8'),
    );

    console.log('applying', featureName);

    // Install dependencies
    await this.mergeDependencies(tempDir, featureConfig);

    // Copy files
    if (featureConfig.copyFiles) {
      for (const file of featureConfig.copyFiles) {
        const src = path.join(featurePath, file.source);
        const dest = path.join(tempDir, file.target);

        await this.copyFile(src, dest);
      }
    }

    if (featureConfig.updateAppModule) {
      this.updateAppModule(tempDir, featureName);
    }

    // Defer partials
    if (featureConfig.partialFiles) {
      pendingPartials.push({
        tempDir,
        featurePath,
        partialFiles: featureConfig.partialFiles,
        featureName,
        architecture,
      });
    }
  }

  // public async applyPendingPartials(
  //   pendingPartials: any[],
  //   appliedFeatures: Set<string>,
  // ): Promise<void> {
  //   for (const {
  //     tempDir,
  //     featurePath,
  //     partialFiles,
  //     featureName,
  //     architecture,
  //   } of pendingPartials) {
  //     for (const [target, partialConfig] of Object.entries(partialFiles) as [
  //       string,
  //       PartialFileMeta,
  //     ][]) {
  //       if (partialConfig.onlyIfFeatures) {
  //         const allPresent = partialConfig.onlyIfFeatures.every((reqFeature) =>
  //           appliedFeatures.has(reqFeature),
  //         );

  //         if (!allPresent) {
  //           console.log(
  //             `[Generator] Skipped partial ${partialConfig.source} - missing required features: ${partialConfig.onlyIfFeatures.join(', ')}`,
  //           );

  //           continue;
  //         }
  //       }

  //       const targetPath = path.join(tempDir, partialConfig.target);

  //       if (!fs.existsSync(targetPath)) {
  //         continue;
  //       }

  //       const partialFilePath = path.join(featurePath, partialConfig.source);

  //       if (!fs.existsSync(partialFilePath)) {
  //         continue;
  //       }

  //       const targetContent = await fs.promises.readFile(targetPath, 'utf-8');
  //       const partialContent = await fs.promises.readFile(
  //         partialFilePath,
  //         'utf-8',
  //       );

  //       // Split partial content by placeholders
  //       const partialSections = partialContent.split('// <!-- ');
  //       let updatedContent = targetContent;

  //       for (const section of partialSections.slice(1)) {
  //         const [placeholder, content] = section.split(' -->');
  //         console.log(placeholder)

  //         if (partialConfig.placeholders.includes(placeholder)) {
  //           const insertMarker = `// <!-- ${placeholder} -->`;
  //           const existingContent =
  //             updatedContent.split(insertMarker)[1]?.split('// <!-- ')[0] || '';
  //           const newContent = content.trim();

  //           // If there's existing content, append the new content
  //           if (existingContent) {
  //             updatedContent = updatedContent.replace(
  //               insertMarker + existingContent,
  //               insertMarker + '\n' + newContent + '\n' + existingContent,
  //             );
  //           } else {
  //             // If no existing content, just add the new content
  //             updatedContent = updatedContent.replace(
  //               insertMarker,
  //               insertMarker + '\n' + newContent,
  //             );
  //           }
  //         }
  //       }

  //       await fs.promises.writeFile(targetPath, updatedContent);
  //     }
  //   }
  // }

  //   public async applyPendingPartials(
  //     pendingPartials: any[],
  //     appliedFeatures: Set<string>,
  //   ): Promise<void> {
  //     for (const {
  //       tempDir,
  //       featurePath,
  //       partialFiles,
  //       featureName,
  //       architecture,
  //     } of pendingPartials) {
  //       for (const [_, partialConfig] of Object.entries(partialFiles) as [
  //         string,
  //         PartialFileMeta,
  //       ][]) {
  //         if (partialConfig.onlyIfFeatures) {
  //           const allPresent = partialConfig.onlyIfFeatures.every((reqFeature) =>
  //             appliedFeatures.has(reqFeature),
  //           );

  //           if (!allPresent) {
  //             console.log(
  //               `[Generator] Skipped partial ${partialConfig.source} - missing required features: ${partialConfig.onlyIfFeatures.join(', ')}`,
  //             );
  //             continue;
  //           }
  //         }

  //         const targetPath = path.join(tempDir, partialConfig.target);
  //         if (!fs.existsSync(targetPath)) continue;

  //         const partialFilePath = path.join(featurePath, partialConfig.source);
  //         if (!fs.existsSync(partialFilePath)) continue;

  //         let targetContent = await fs.promises.readFile(targetPath, 'utf-8');
  //         const partialContent = await fs.promises.readFile(
  //           partialFilePath,
  //           'utf-8',
  //         );

  //         for (const placeholder of partialConfig.placeholders) {
  //           const marker = `// <!-- ${placeholder} -->`;

  //           if (!partialContent.includes(marker)) {
  //             console.warn(
  //               `[Partial] Marker ${marker} not found in partial source.`,
  //             );
  //             continue;
  //           }

  //           const contentToInsert = this.extractSection(
  //             partialContent,
  //             placeholder,
  //           );
  // console.log('Matched:', this.extractSection(partialContent, 'SERVICE_METHODS'));
  //           if (!contentToInsert) continue;

  //           const existingSection = targetContent.includes(marker)
  //             ? (targetContent.split(marker)[1]?.split('// <!--')[0] ?? '')
  //             : '';

  //           const insertion = existingSection
  //             ? `${marker}\n${contentToInsert.trim()}\n${existingSection}`
  //             : `${marker}\n${contentToInsert.trim()}`;

  //           targetContent = targetContent.replace(marker, insertion);
  //         }

  //         await fs.promises.writeFile(targetPath, targetContent);
  //       }
  //     }
  //   }

  //   private extractSection(content: string, placeholder: string): string | null {
  //     const regex = new RegExp(
  //       `//\\s*<!--\\s*${placeholder}\\s*-->\\s*\\n?([\\s\\S]*?)(?=\\n?\\s*//\\s*<!--|$)`,
  //       'm',
  //     );
  //     const match = content.match(regex);
  //     return match?.[1]?.trim() ?? null;
  //   }

  public async applyPendingPartials(
    pendingPartials: any[],
    appliedFeatures: Set<string>,
  ): Promise<void> {
    for (const {
      tempDir,
      featurePath,
      partialFiles,
      featureName,
      architecture,
    } of pendingPartials) {
      for (const [_, partialConfig] of Object.entries(partialFiles) as [
        string,
        PartialFileMeta,
      ][]) {
        if (partialConfig.onlyIfFeatures) {
          const allPresent = partialConfig.onlyIfFeatures.every((reqFeature) =>
            appliedFeatures.has(reqFeature),
          );
          if (!allPresent) continue;
        }

        const targetPath = path.join(tempDir, partialConfig.target);
        const partialPath = path.join(featurePath, partialConfig.source);
        if (!fs.existsSync(targetPath) || !fs.existsSync(partialPath)) continue;

        let targetContent = await fs.promises.readFile(targetPath, 'utf-8');
        const partialContent = await fs.promises.readFile(partialPath, 'utf-8');

        for (let i = 0; i < partialConfig.placeholders.length; i++) {
          const current = partialConfig.placeholders[i];
          const next = partialConfig.placeholders[i + 1];
          const marker = `// <!-- ${current} -->`;

          // console.log('===>', current, next);
          const contentToInsert = this.extractFromTo(
            partialContent,
            current,
            next,
          );
          // console.log(contentToInsert);
          if (!contentToInsert) continue;

          // console.log('contentToInsert', contentToInsert);

          const existingSection = targetContent.includes(marker)
            ? (targetContent.split(marker)[1]?.split('// <!--')[0] ?? '')
            : '';

          // console.log('existingSection', existingSection);
          // console.log('marker', marker);

          // const insertion = existingSection
          //   ? `${marker}\n${contentToInsert.trim()}\n${existingSection}`
          //   : `${marker}\n${contentToInsert.trim()}`;

          const insertion = `${marker}\n${contentToInsert.trim()}`;
          // const insertion = `\n${contentToInsert.trim()}`;

          targetContent = targetContent.replace(marker, insertion);
        }

        await fs.promises.writeFile(targetPath, targetContent);
      }
    }
  }

  private extractFromTo(
    content: string,
    start: string,
    end?: string,
  ): string | null {
    const startRegex = new RegExp(`//\\s*<!--\\s*${start}\\s*-->`, 'g');
    const endRegex = end
      ? new RegExp(`//\\s*<!--\\s*${end}\\s*-->`, 'g')
      : null;

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

  private async updateAppModule(tempDir: string, feature: string) {
    console.log('updateAppModule');
    const appModulePath = path.join(tempDir, 'src/app.module.ts');
    const appModuleContent = await fs.promises.readFile(appModulePath, 'utf-8');

    // Add import statement with correct path
    const importStatement = `import { ${this.capitalizeFirstLetter(feature)}Module } from './${feature}/${feature}.module';`;
    const updatedContent = appModuleContent.replace(
      /import.*?;/,
      `$&\n${importStatement}`,
    );

    // Add module to imports array
    const moduleName = `${this.capitalizeFirstLetter(feature)}Module`;
    const updatedImports = updatedContent.replace(
      /@Module\({[\s\S]*?imports:\s*\[([\s\S]*?)\]/,
      `@Module({\n  imports: [\n$1    ${moduleName},  ]`,
    );

    await fs.promises.writeFile(appModulePath, updatedImports);
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
      output.on('close', async () => {
        const buffer = await fs.promises.readFile(zipPath);
        resolve(buffer);
      });

      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(directory, false);
      archive.finalize();
    });
  }

  private async copyFile(src: string, dest: string): Promise<void> {
    await fs.promises.mkdir(path.dirname(dest), { recursive: true });
    await fs.promises.copyFile(src, dest);
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
    const fileExtensions = ['.ts', '.js', '.json', '.env']; // Adjust as needed

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

  private async mergeDependencies(tempDir: string, config: any): Promise<void> {
    const pkgPath = path.join(tempDir, 'package.json');
    const pkg = JSON.parse(await fs.promises.readFile(pkgPath, 'utf8'));

    if (config.dependencies) {
      pkg.dependencies = {
        ...pkg.dependencies,
        ...config.dependencies,
      };
    }

    if (config.devDependencies) {
      pkg.devDependencies = {
        ...pkg.devDependencies,
        ...config.devDependencies,
      };
    }

    await fs.promises.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
  }

  private capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  private async resolveFeaturePath(
    feature: string,
    architecture: 'monolith' | 'microservice',
  ): Promise<string> {
    const relativePath = path.join(...feature.split(':'));

    const sharedPath = path.join(this.templatesPath, 'shared', relativePath);
    const archPath = path.join(
      this.templatesPath,
      architecture,
      'modules',
      relativePath,
    );

    if (await this.pathExists(sharedPath)) {
      return sharedPath;
    }

    if (await this.pathExists(archPath)) {
      return archPath;
    }

    throw new Error(
      `Feature "${feature}" not found in shared or ${architecture} templates.`,
    );
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
