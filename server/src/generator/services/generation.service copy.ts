import { Injectable, Logger } from '@nestjs/common';
import { GenerateProjectDto } from '../dto/generate-project.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

@Injectable()
export class GenerationService {
	private readonly logger = new Logger(GenerationService.name);
	private readonly templatesPath = path.join(process.cwd(), 'templates');
	private readonly starterPath = path.join(this.templatesPath, 'starter');
	private readonly featuresPath = path.join(this.templatesPath, 'features');

	private appliedFeatures = new Set<string>();
	private pendingPartials: {
		tempDir: string;
		featurePath: string;
		partialFiles: Record<string, any>;
	}[] = [];

	async generateProject(dto: GenerateProjectDto): Promise<Buffer> {
		console.log(dto.architecture);

		const tempDir = path.join(__dirname, '../../temp', Date.now().toString());
		await fs.promises.mkdir(tempDir, { recursive: true });

		try {
			// 1. Copy base starter project
			await this.copyDirectory(this.starterPath, tempDir);

			// 2. Update package.json with project name
			await this.updatePackageJson(tempDir, dto.projectName);

			// 3. Apply all features EXCEPT partials
			for (const feature of dto.features) {
				await this.applyFeature(tempDir, feature, dto.config);
			}

			// 4. Apply all deferred partials
			for (const partial of this.pendingPartials) {
				await this.applyPartialFiles(
					partial.tempDir,
					partial.featurePath,
					partial.partialFiles,
				);
			}

			// Remove markers used in generation
			await this.removePlaceholderComments(tempDir);

			// Format the code
			await execAsync(`npx prettier "**/*.{ts,js,json,md}" --write`, {
				cwd: tempDir
			});

			// Create zip file
			const zipBuffer = await this.createZip(tempDir);

			// Cleanup
			await fs.promises.rm(tempDir, { recursive: true, force: true });

			return zipBuffer;
		} catch (error) {
			this.logger.error(`Generation failed: ${error.message}`, error.stack);
			// Cleanup on error
			await fs.promises
				.rm(tempDir, { recursive: true, force: true })
				.catch(() => { });
			throw error;
		}
	}

	private async copyDirectory(src: string, dest: string) {
		const entries = await fs.promises.readdir(src, { withFileTypes: true });

		for (const entry of entries) {
			const srcPath = path.join(src, entry.name);
			const destPath = path.join(dest, entry.name);

			if (entry.isDirectory()) {
				await fs.promises.mkdir(destPath, { recursive: true });
				await this.copyDirectory(srcPath, destPath);
			} else {
				await fs.promises.copyFile(srcPath, destPath);
			}
		}
	}

	private async updatePackageJson(tempDir: string, projectName: string) {
		const packageJsonPath = path.join(tempDir, 'package.json');
		const packageJson = JSON.parse(
			await fs.promises.readFile(packageJsonPath, 'utf-8'),
		);

		packageJson.name = projectName;
		packageJson.description = `Generated NestJS project: ${projectName}`;

		await fs.promises.writeFile(
			packageJsonPath,
			JSON.stringify(packageJson, null, 2),
		);
	}

	// private async applyFeature(tempDir: string, feature: string, config: any) {
	//     console.log('feature:', feature);

	//     let featurePath: string;
	//     let featureConfig: any;

	//     if (feature.includes(':')) {
	//         const [featureGroup, variant] = feature.split(':');
	//         featurePath = path.join(this.featuresPath, featureGroup, variant);
	//       } else {
	//         featurePath = path.join(this.featuresPath, feature);
	//       }

	//     if (!fs.existsSync(featurePath)) {
	//         throw new Error(`Feature '${feature}' not found at ${featurePath}`);
	//     }

	//     // Load feature configuration
	//     const featureConfigPath = path.join(featurePath, 'feature.config.json');
	//     if (fs.existsSync(featureConfigPath)) {
	//         const featureConfig = JSON.parse(await fs.promises.readFile(featureConfigPath, 'utf-8'));

	//         // Add dependencies
	//         if (featureConfig.dependencies) {
	//             await this.addDependencies(tempDir, featureConfig.dependencies);
	//         }

	//         // Add devDependencies
	//         if (featureConfig.devDependencies) {
	//             await this.addDevDependencies(tempDir, featureConfig.devDependencies);
	//         }

	//         // Handle required features
	//         if (featureConfig.requires) {
	//             // TODO: CHECK IF REQUIRED IS ALREADY EXISTING FEATURE - SHOULD SKIP IF TRUE
	//             for (const requiredFeature of featureConfig.requires) {
	//                 await this.applyFeature(tempDir, requiredFeature, config);
	//             }
	//         }

	//         // Handle partial files
	//         if (featureConfig.partialFiles) {
	//             await this.applyPartialFiles(tempDir, featurePath, featureConfig.partialFiles);
	//         }

	//         // Copy declared files
	//         if (featureConfig.copyFiles) {
	//             for (const file of featureConfig.copyFiles) {
	//             const sourcePath = path.join(featurePath, file.source);
	//             const targetPath = path.join(tempDir, file.target);

	//             if (!fs.existsSync(sourcePath)) {
	//                 throw new Error(`Missing source file: ${sourcePath}`);
	//             }

	//             await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });
	//             await fs.promises.copyFile(sourcePath, targetPath);
	//             }
	//         }

	//     }

	//     // Apply feature-specific configurations
	//     if (config[feature]) {
	//         await this.applyFeatureConfig(tempDir, feature, config[feature]);
	//     }
	// }

	private async applyFeature(tempDir: string, feature: string, config: any) {
		const parts = feature.split(':');
		let cumulativePath = '';
		let relativePath = '';

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			cumulativePath = cumulativePath ? `${cumulativePath}:${part}` : part;
			relativePath = path.join(relativePath, part);

			if (!this.appliedFeatures.has(cumulativePath)) {
				const fullFeaturePath = path.join(this.featuresPath, relativePath);
				await this.applyFeatureConfigSet(
					tempDir,
					fullFeaturePath,
					config,
					cumulativePath,
				);
				this.appliedFeatures.add(cumulativePath);
			}
		}
	}

	private async applyFeatureConfigSet(
		tempDir: string,
		featurePath: string,
		config: any,
		featureKey: string,
	) {
		const configPath = path.join(featurePath, 'feature.config.json');
		if (!fs.existsSync(configPath)) {
			console.warn(
				`[Generator] Skipped: No config found for ${featureKey} at ${configPath}`,
			);
			return;
		}

		const featureConfig = JSON.parse(
			await fs.promises.readFile(configPath, 'utf-8'),
		);

		console.log(`[Generator] Applying feature: ${featureKey}`);

		await this.applyDependencies(tempDir, featureConfig);
		await this.applyRequires(tempDir, featureConfig, config);
		// await this.applyPartials(tempDir, featurePath, featureConfig);
		await this.applyCopyFiles(tempDir, featurePath, featureConfig);

		if (featureConfig.partialFiles) {
			this.pendingPartials.push({
				tempDir,
				featurePath,
				partialFiles: featureConfig.partialFiles,
			});
		}

		if (featureConfig.updateAppModule) {
			this.updateAppModule(tempDir, featureKey)
		}

		if (config && config[featureKey]) {
			await this.applyFeatureConfig(tempDir, featureKey, config[featureKey]);
		}
	}

	private async applyDependencies(tempDir: string, featureConfig: any) {
		if (featureConfig.dependencies) {
			await this.addDependencies(tempDir, featureConfig.dependencies);
		}
		if (featureConfig.devDependencies) {
			await this.addDevDependencies(tempDir, featureConfig.devDependencies);
		}
	}

	private async applyRequires(
		tempDir: string,
		featureConfig: any,
		config: any,
	) {
		if (featureConfig.requires) {
			for (const requiredFeature of featureConfig.requires) {
				await this.applyFeature(tempDir, requiredFeature, config);
			}
		}
	}

	private async applyPartials(
		tempDir: string,
		featurePath: string,
		featureConfig: any,
	) {
		if (!featureConfig.partialFiles) return;

		await this.applyPartialFiles(
			tempDir,
			featurePath,
			featureConfig.partialFiles,
		);
	}

	private async applyCopyFiles(
		tempDir: string,
		featurePath: string,
		featureConfig: any,
	) {
		if (!featureConfig.copyFiles) return;

		for (const file of featureConfig.copyFiles) {
			const sourcePath = path.join(featurePath, file.source);
			const targetPath = path.join(tempDir, file.target);

			if (!fs.existsSync(sourcePath)) {
				throw new Error(`Missing source file: ${sourcePath}`);
			}

			await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });
			await fs.promises.copyFile(sourcePath, targetPath);
		}
	}

	//   private async applyFeatureConfigSet(
	//     tempDir: string,
	//     featurePath: string,
	//     config: any,
	//     featureKey: string,
	//   ) {
	//     if (!fs.existsSync(featurePath)) {
	//       throw new Error(`Feature '${featureKey}' not found at ${featurePath}`);
	//     }

	//     const featureConfigPath = path.join(featurePath, 'feature.config.json');
	//     if (!fs.existsSync(featureConfigPath)) return;

	//     const featureConfig = JSON.parse(
	//       await fs.promises.readFile(featureConfigPath, 'utf-8'),
	//     );

	//     // Dependencies
	//     if (featureConfig.dependencies) {
	//       await this.addDependencies(tempDir, featureConfig.dependencies);
	//     }
	//     if (featureConfig.devDependencies) {
	//       await this.addDevDependencies(tempDir, featureConfig.devDependencies);
	//     }

	//     // Required features
	//     if (featureConfig.requires) {
	//       for (const required of featureConfig.requires) {
	//         await this.applyFeature(tempDir, required, config);
	//       }
	//     }

	//     // Partials
	//     if (featureConfig.partialFiles) {
	//       await this.applyPartialFiles(
	//         tempDir,
	//         featurePath,
	//         featureConfig.partialFiles,
	//       );
	//     }

	//     // File copies
	//     if (featureConfig.copyFiles) {
	//       for (const file of featureConfig.copyFiles) {
	//         const sourcePath = path.join(featurePath, file.source);
	//         const targetPath = path.join(tempDir, file.target);

	//         if (!fs.existsSync(sourcePath)) {
	//           throw new Error(`Missing source file: ${sourcePath}`);
	//         }

	//         await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });
	//         await fs.promises.copyFile(sourcePath, targetPath);
	//       }
	//     }

	//     // Feature-specific config
	//     if (config[featureKey]) {
	//       await this.applyFeatureConfig(tempDir, featureKey, config[featureKey]);
	//     }
	//   }

	private async addDependencies(
		tempDir: string,
		dependencies: Record<string, string>,
	) {
		const mainPackageJsonPath = path.join(tempDir, 'package.json');
		const mainPackageJson = JSON.parse(
			await fs.promises.readFile(mainPackageJsonPath, 'utf-8'),
		);

		mainPackageJson.dependencies = {
			...mainPackageJson.dependencies,
			...dependencies,
		};

		await fs.promises.writeFile(
			mainPackageJsonPath,
			JSON.stringify(mainPackageJson, null, 2),
		);
	}

	private async addDevDependencies(
		tempDir: string,
		devDependencies: Record<string, string>,
	) {
		const mainPackageJsonPath = path.join(tempDir, 'package.json');
		const mainPackageJson = JSON.parse(
			await fs.promises.readFile(mainPackageJsonPath, 'utf-8'),
		);

		mainPackageJson.devDependencies = {
			...mainPackageJson.devDependencies,
			...devDependencies,
		};

		await fs.promises.writeFile(
			mainPackageJsonPath,
			JSON.stringify(mainPackageJson, null, 2),
		);
	}

	private async updateAppModule(tempDir: string, feature: string) {
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

	private capitalizeFirstLetter(string: string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	private async applyFeatureConfig(
		tempDir: string,
		feature: string,
		config: any,
	) {
		const envPath = path.join(tempDir, '.env');
		let envContent = '';

		if (fs.existsSync(envPath)) {
			envContent = await fs.promises.readFile(envPath, 'utf-8');
		}

		switch (feature) {
			case 'database':
				envContent += `\nDB_TYPE=${config.type}
DB_HOST=${config.host}
DB_PORT=${config.port}
DB_DATABASE=${config.database}
DB_USERNAME=${config.username}
DB_PASSWORD=${config.password}`;
				break;
			case 'auth':
				envContent += `\nJWT_SECRET=${config.jwtSecret}
JWT_EXPIRATION=${config.jwtExpiration}`;
				break;
			case 'auth:google':
				envContent += `\nGOOGLE_CLIENT_ID=${config.clientId}
GOOGLE_CLIENT_SECRET=${config.clientSecret}
GOOGLE_CALLBACK_URL=${config.callbackUrl}`;
				break;
		}

		await fs.promises.writeFile(envPath, envContent);
	}

	private async createZip(tempDir: string): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const archive = archiver('zip', {
				zlib: { level: 9 },
			});

			const chunks: Buffer[] = [];
			archive.on('data', (chunk) => chunks.push(chunk));
			archive.on('end', () => resolve(Buffer.concat(chunks)));
			archive.on('error', reject);

			archive.directory(tempDir, false);
			archive.finalize();
		});
	}

	private async applyPartialFiles(
		tempDir: string,
		featurePath: string,
		partialFiles: Record<string, any>,
	) {
		for (const [_, partialConfig] of Object.entries(partialFiles)) {

			// ✅ NEW: Check if conditional features are required
			if (partialConfig.onlyIfFeatures) {
				const allPresent = partialConfig.onlyIfFeatures.every((reqFeature) =>
					this.appliedFeatures.has(reqFeature),
				);

				if (!allPresent) {
					console.log(
						`[Generator] Skipped partial ${partialConfig.source} - missing required features: ${partialConfig.onlyIfFeatures.join(', ')}`,
					);

					continue;
				}
			}


			const targetPath = path.join(tempDir, partialConfig.target);

			if (!fs.existsSync(targetPath)) {
				continue;
			}

			const partialFilePath = path.join(featurePath, partialConfig.source);

			if (!fs.existsSync(partialFilePath)) {
				continue;
			}

			const targetContent = await fs.promises.readFile(targetPath, 'utf-8');
			const partialContent = await fs.promises.readFile(
				partialFilePath,
				'utf-8',
			);

			// Split partial content by placeholders
			const partialSections = partialContent.split('// <!-- ');
			let updatedContent = targetContent;

			for (const section of partialSections.slice(1)) {
				const [placeholder, content] = section.split(' -->');

				if (partialConfig.placeholders.includes(placeholder)) {
					const insertMarker = `// <!-- ${placeholder} -->`;
					const existingContent =
						updatedContent.split(insertMarker)[1]?.split('// <!-- ')[0] || '';
					const newContent = content.trim();

					// If there's existing content, append the new content
					if (existingContent) {
						updatedContent = updatedContent.replace(
							insertMarker + existingContent,
							insertMarker + '\n' + newContent + '\n' + existingContent,
						);
					} else {
						// If no existing content, just add the new content
						updatedContent = updatedContent.replace(
							insertMarker,
							insertMarker + '\n' + newContent,
						);
					}
				}
			}

			await fs.promises.writeFile(targetPath, updatedContent);
		}
	}

	private async removePlaceholderComments(dir: string) {
		const fileExtensions = ['.ts', '.js', '.json', '.env']; // Adjust as needed

		const walk = async (dirPath: string): Promise<string[]> => {
			const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
			const files: string[] = [];

			for (const entry of entries) {
				const fullPath = path.join(dirPath, entry.name);
				if (entry.isDirectory()) {
					files.push(...await walk(fullPath));
				} else if (fileExtensions.some(ext => entry.name.endsWith(ext))) {
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
}
