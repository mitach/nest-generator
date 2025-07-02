import { Test, TestingModule } from '@nestjs/testing';
import { ProjectBuilderService } from './project-builder.service';
import { HandlebarsTemplateService } from './handlebars-template.service';
import { DependencyResolverService } from './dependency-resolver.service';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import { FeatureNotFoundError, FileSystemError } from '../../common/errors/generation.errors';

jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('ProjectBuilderService', () => {
  let service: ProjectBuilderService;
  let handlebarsService: jest.Mocked<HandlebarsTemplateService>;
  let dependencyResolver: jest.Mocked<DependencyResolverService>;

  beforeEach(async () => {
    const mockHandlebarsService = {
      processTemplateFile: jest.fn(),
      processTemplate: jest.fn(),
    };

    const mockDependencyResolver = {
      resolveDependencies: jest.fn().mockReturnValue({
        dependencies: {},
        devDependencies: {},
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectBuilderService,
        {
          provide: HandlebarsTemplateService,
          useValue: mockHandlebarsService,
        },
        {
          provide: DependencyResolverService,
          useValue: mockDependencyResolver,
        },
      ],
    }).compile();

    service = module.get<ProjectBuilderService>(ProjectBuilderService);
    handlebarsService = module.get(HandlebarsTemplateService);
    dependencyResolver = module.get(DependencyResolverService);

    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    mockFs.promises = {
      readFile: jest.fn(),
      writeFile: jest.fn(),
      mkdir: jest.fn(),
      readdir: jest.fn(),
      copyFile: jest.fn(),
      access: jest.fn(),
      rm: jest.fn(),
    } as any;

    mockFs.existsSync = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updatePackageJson', () => {
    it('should update package.json with project name', async () => {
      const mockPackageJson = { name: 'old-name', version: '1.0.0' };
      (mockFs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockPackageJson));
      (mockFs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      await service.updatePackageJson('/project', 'new-project-name');

      const [[actualPath, actualContent]] = (mockFs.promises.writeFile as jest.Mock).mock.calls;

      expect(actualPath.replace(/\\/g, '/')).toBe('/project/package.json');
      expect(actualContent).toBe(
        JSON.stringify({ name: 'new-project-name', version: '1.0.0' }, null, 2),
      );
    });
  });

  describe('applyFeature', () => {
    it('should apply simple feature successfully', async () => {
      const appliedFeatures = new Set<string>();
      const pendingPartials: any[] = [];

      (mockFs.promises.access as jest.Mock).mockResolvedValue(undefined);
      mockFs.existsSync = jest.fn().mockReturnValue(true);
      (mockFs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify({}));

      await service.applyFeature(
        '/temp',
        'cors',
        ['cors'],
        {},
        appliedFeatures,
        pendingPartials,
        'monolith',
      );

      expect(appliedFeatures.has('cors')).toBe(true);
    });

    it('should throw FeatureNotFoundError for missing feature', async () => {
      const appliedFeatures = new Set<string>();
      const pendingPartials: any[] = [];

      (mockFs.promises.access as jest.Mock).mockRejectedValue(new Error('Not found'));

      await expect(
        service.applyFeature(
          '/temp',
          'unknown-feature',
          ['unknown-feature'],
          {},
          appliedFeatures,
          pendingPartials,
          'monolith',
        ),
      ).rejects.toThrow(FeatureNotFoundError);
    });
  });

  describe('applyFeatureConfig', () => {
    it('should handle missing feature config gracefully', async () => {
      mockFs.existsSync = jest.fn().mockReturnValue(false);
      const mockWarn = jest.spyOn(Logger.prototype, 'warn');

      await service.applyFeatureConfig(
        '/temp',
        'test-feature',
        '/feature/path',
        ['test-feature'],
        {},
        new Set(),
        [],
        'monolith',
      );

      expect(mockWarn).toHaveBeenCalledWith(
        expect.stringContaining('No feature config found for test-feature'),
      );
    });

    it('should throw FileSystemError for missing source file', async () => {
      mockFs.existsSync = jest
        .fn()
        .mockReturnValueOnce(true) // config exists
        .mockReturnValueOnce(false); // source file missing
      (mockFs.promises.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({
          copyFiles: [{ source: 'missing.ts', target: 'src/output.ts' }],
        }),
      );

      await expect(
        service.applyFeatureConfig(
          '/temp',
          'test-feature',
          '/feature/path',
          ['test-feature'],
          {},
          new Set(),
          [],
          'monolith',
        ),
      ).rejects.toThrow(FileSystemError);
    });
  });

  describe('applyPendingPartials', () => {
    it('should process partial files correctly', async () => {
      const pendingPartials = [
        {
          tempDir: '/temp',
          featurePath: '/feature',
          partialFiles: {
            test: {
              target: 'src/app.module.ts',
              source: 'partials/test.partial',
              placeholders: ['IMPORTS'],
            },
          },
          featureName: 'test-feature',
          architecture: 'monolith',
          config: {},
          allFeatures: ['test-feature'],
        },
      ];

      mockFs.existsSync = jest.fn().mockReturnValue(true);
      (mockFs.promises.readFile as jest.Mock)
        .mockResolvedValueOnce('// <!-- IMPORTS -->')
        .mockResolvedValueOnce('import { Test } from "./test";');
      (mockFs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      handlebarsService.processTemplate.mockReturnValue('import { Test } from "./test";');

      await service.applyPendingPartials(pendingPartials, new Set(['test-feature']));

      expect(handlebarsService.processTemplate).toHaveBeenCalled();
    });
  });
});
