import { Test, TestingModule } from '@nestjs/testing';
import { MonolithStrategy } from './monolith.strategy';
import { ProjectBuilderService } from '../services/project-builder.service';
import { MonolithProjectData } from '../types/generation.types';

describe('MonolithStrategy', () => {
  let strategy: MonolithStrategy;
  let builderService: jest.Mocked<ProjectBuilderService>;

  beforeEach(async () => {
    const mockBuilderService = {
      copyStarterTemplate: jest.fn(),
      updatePackageJson: jest.fn(),
      applyFeature: jest.fn(),
      applyPendingPartials: jest.fn(),
      finalizeProject: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonolithStrategy,
        {
          provide: ProjectBuilderService,
          useValue: mockBuilderService,
        },
      ],
    }).compile();

    strategy = module.get<MonolithStrategy>(MonolithStrategy);
    builderService = module.get(ProjectBuilderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateProject', () => {
    const mockProjectData: MonolithProjectData = {
      projectName: 'test-monolith',
      features: ['cors', 'validation', 'auth:jwt'],
      config: {
        cors: { origin: ['http://localhost:3000'] },
        auth: { jwtSecret: 'test-secret' },
      },
    };

    it('should generate monolith project successfully', async () => {
      const mockBuffer = Buffer.from('test project');
      builderService.copyStarterTemplate.mockResolvedValue();
      builderService.updatePackageJson.mockResolvedValue();
      builderService.applyFeature.mockResolvedValue();
      builderService.applyPendingPartials.mockResolvedValue();
      builderService.finalizeProject.mockResolvedValue(mockBuffer);

      const result = await strategy.generateProject(mockProjectData);

      expect(result).toBe(mockBuffer);
      expect(builderService.copyStarterTemplate).toHaveBeenCalledTimes(1);
      expect(builderService.updatePackageJson).toHaveBeenCalledWith(
        expect.stringContaining('temp'),
        'test-monolith',
      );
      expect(builderService.applyFeature).toHaveBeenCalledTimes(3);
      expect(builderService.applyPendingPartials).toHaveBeenCalledTimes(1);
      expect(builderService.finalizeProject).toHaveBeenCalledTimes(1);
    });

    it('should call copyStarterTemplate with correct paths', async () => {
      builderService.finalizeProject.mockResolvedValue(Buffer.from('test'));

      await strategy.generateProject(mockProjectData);

      const [[starterPath, tempPath]] = builderService.copyStarterTemplate.mock.calls;

      expect(starterPath.replace(/\\/g, '/')).toContain('templates/monolith/starter');
      expect(tempPath.replace(/\\/g, '/')).toContain('temp');
    });

    it('should apply each feature with monolith architecture', async () => {
      builderService.finalizeProject.mockResolvedValue(Buffer.from('test'));

      await strategy.generateProject(mockProjectData);

      expect(builderService.applyFeature).toHaveBeenCalledWith(
        expect.stringContaining('temp'),
        'cors',
        ['cors', 'validation', 'auth:jwt'],
        mockProjectData.config,
        expect.any(Set),
        expect.any(Array),
        'monolith',
      );

      expect(builderService.applyFeature).toHaveBeenCalledWith(
        expect.stringContaining('temp'),
        'validation',
        ['cors', 'validation', 'auth:jwt'],
        mockProjectData.config,
        expect.any(Set),
        expect.any(Array),
        'monolith',
      );

      expect(builderService.applyFeature).toHaveBeenCalledWith(
        expect.stringContaining('temp'),
        'auth:jwt',
        ['cors', 'validation', 'auth:jwt'],
        mockProjectData.config,
        expect.any(Set),
        expect.any(Array),
        'monolith',
      );
    });

    it('should handle empty features array', async () => {
      const emptyProjectData: MonolithProjectData = {
        projectName: 'empty-project',
        features: [],
        config: {},
      };

      builderService.finalizeProject.mockResolvedValue(Buffer.from('empty project'));

      const result = await strategy.generateProject(emptyProjectData);

      expect(result).toBeInstanceOf(Buffer);
      expect(builderService.applyFeature).not.toHaveBeenCalled();
      expect(builderService.applyPendingPartials).toHaveBeenCalledWith([], expect.any(Set));
    });

    it('should handle project without config', async () => {
      const projectDataNoConfig: MonolithProjectData = {
        projectName: 'no-config-project',
        features: ['cors'],
      };

      builderService.finalizeProject.mockResolvedValue(Buffer.from('test'));

      await strategy.generateProject(projectDataNoConfig);

      expect(builderService.applyFeature).toHaveBeenCalledWith(
        expect.any(String),
        'cors',
        ['cors'],
        {},
        expect.any(Set),
        expect.any(Array),
        'monolith',
      );
    });

    it('should propagate errors from builder service', async () => {
      builderService.copyStarterTemplate.mockRejectedValue(new Error('Copy failed'));

      await expect(strategy.generateProject(mockProjectData)).rejects.toThrow('Copy failed');
    });

    it('should create unique temp directories', async () => {
      builderService.finalizeProject.mockResolvedValue(Buffer.from('test'));

      const calls: string[] = [];
      builderService.copyStarterTemplate.mockImplementation((source, dest) => {
        calls.push(dest);
        return Promise.resolve();
      });

      await strategy.generateProject(mockProjectData);
      await new Promise((resolve) => setTimeout(resolve, 2));
      await strategy.generateProject(mockProjectData);
      expect(calls[0]).not.toBe(calls[1]);
    });

    it('should maintain applied features state during generation', async () => {
      builderService.finalizeProject.mockResolvedValue(Buffer.from('test'));

      let capturedAppliedFeatures: Set<string>;
      builderService.applyPendingPartials.mockImplementation((partials, appliedFeatures) => {
        capturedAppliedFeatures = appliedFeatures;
        return Promise.resolve();
      });

      await strategy.generateProject(mockProjectData);

      expect(capturedAppliedFeatures!).toBeInstanceOf(Set);
    });
  });

  describe('private methods', () => {
    it('should create temp directory with timestamp format', () => {
      const tempDir = (strategy as any).createTempDir();
      const normalizedDir = tempDir.replace(/\\/g, '/');

      expect(normalizedDir).toMatch(/temp\/\d+$/);
      expect(normalizedDir).toContain('temp/');
    });

    it('should get correct starter path', () => {
      const starterPath = (strategy as any).getStarterPath();
      const normalizedPath = starterPath.replace(/\\/g, '/');

      expect(normalizedPath).toContain('templates/monolith/starter');
    });
  });
});
