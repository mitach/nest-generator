import { Test, TestingModule } from '@nestjs/testing';
import { GeneratorService } from './generator.service';
import { GenerationService } from './generation.service';
import { GenerateProjectDto } from '../dto/generate-project.dto';
import { Logger } from '@nestjs/common';
import { GenerationError } from '../../common/errors/generation.errors';

describe('GeneratorService', () => {
  let service: GeneratorService;
  let generationService: jest.Mocked<GenerationService>;

  beforeEach(async () => {
    const mockGenerationService = {
      generateProject: jest.fn().mockResolvedValue(Buffer.from('test')),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneratorService,
        {
          provide: GenerationService,
          useValue: mockGenerationService,
        },
      ],
    }).compile();

    service = module.get<GeneratorService>(GeneratorService);
    generationService = module.get(GenerationService) as jest.Mocked<GenerationService>;

    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startGeneration', () => {
    const mockDto: GenerateProjectDto = {
      projectName: 'test-project',
      features: ['cors', 'validation'],
      architecture: 'monolith',
      config: {},
    };

    it('should start generation and return generation ID', () => {
      const generationId = service.startGeneration(mockDto);

      expect(generationId).toBeDefined();
      expect(typeof generationId).toBe('string');
      expect(generationId.length).toBeGreaterThan(0);
    });

    it('should set initial status to pending', () => {
      const generationId = service.startGeneration(mockDto);
      const status = service.getGenerationStatus(generationId);

      expect(status.status).toBe('pending');
      expect(status.project).toBeUndefined();
      expect(status.error).toBeUndefined();
    });

    it('should call generationService.generateProject', () => {
      service.startGeneration(mockDto);

      expect(generationService.generateProject).toHaveBeenCalledWith(mockDto);
    });

    it('should handle successful generation completion', async () => {
      const mockProject = Buffer.from('test project content');
      generationService.generateProject.mockResolvedValue(mockProject);

      const generationId = service.startGeneration(mockDto);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const status = service.getGenerationStatus(generationId);
      expect(status.status).toBe('completed');
      expect(status.project).toBe(mockProject);
      expect(status.error).toBeUndefined();
    });

    it('should handle generation failure', async () => {
      const mockError = new GenerationError('Generation failed', 'TEST_ERROR');
      generationService.generateProject.mockRejectedValue(mockError);

      const generationId = service.startGeneration(mockDto);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const status = service.getGenerationStatus(generationId);
      expect(status.status).toBe('failed');
      expect(status.project).toBeUndefined();
      expect(status.error).toBeDefined();
      expect(status.error!.code).toBe('TEST_ERROR');
    });

    it('should handle regular Error objects', async () => {
      const mockError = new Error('Regular error');
      generationService.generateProject.mockRejectedValue(mockError);

      const generationId = service.startGeneration(mockDto);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const status = service.getGenerationStatus(generationId);
      expect(status.status).toBe('failed');
      expect(status.error!.code).toBe('UNKNOWN_ERROR');
      expect(status.error!.message).toBe('Regular error');
    });
  });

  describe('getGenerationStatus', () => {
    it('should return status for existing generation', () => {
      const generationId = service.startGeneration({
        projectName: 'test',
        features: [],
        architecture: 'monolith',
        config: {},
      });

      const status = service.getGenerationStatus(generationId);

      expect(status).toBeDefined();
      expect(status.status).toBe('pending');
    });

    it('should throw error for non-existing generation', () => {
      expect(() => {
        service.getGenerationStatus('non-existing-id');
      }).toThrow(GenerationError);

      expect(() => {
        service.getGenerationStatus('non-existing-id');
      }).toThrow('Generation not found');
    });

    it('should include generation ID in error details', () => {
      try {
        service.getGenerationStatus('non-existing-id');
      } catch (error) {
        expect(error).toBeInstanceOf(GenerationError);
        expect((error as GenerationError).details).toEqual({ generationId: 'non-existing-id' });
      }
    });
  });

  describe('getGeneratedProject', () => {
    it('should return project buffer for completed generation', async () => {
      const mockProject = Buffer.from('test project content');
      generationService.generateProject.mockResolvedValue(mockProject);

      const generationId = service.startGeneration({
        projectName: 'test',
        features: [],
        architecture: 'monolith',
        config: {},
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = service.getGeneratedProject(generationId);
      expect(result).toBe(mockProject);
    });

    it('should throw error for non-existing generation', () => {
      expect(() => {
        service.getGeneratedProject('non-existing-id');
      }).toThrow('Generation not found');
    });

    it('should throw error for pending generation', () => {
      const generationId = service.startGeneration({
        projectName: 'test',
        features: [],
        architecture: 'monolith',
        config: {},
      });

      expect(() => {
        service.getGeneratedProject(generationId);
      }).toThrow('Project not ready for download');
    });

    it('should throw error for failed generation', async () => {
      generationService.generateProject.mockRejectedValue(new Error('Generation failed'));

      const generationId = service.startGeneration({
        projectName: 'test',
        features: [],
        architecture: 'monolith',
        config: {},
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(() => {
        service.getGeneratedProject(generationId);
      }).toThrow('Project not ready for download');
    });

    it('should throw error if project data is missing', async () => {
      const generationId = service.startGeneration({
        projectName: 'test',
        features: [],
        architecture: 'monolith',
        config: {},
      });

      (service as any).generations.set(generationId, {
        status: 'completed',
        project: undefined,
      });

      expect(() => {
        service.getGeneratedProject(generationId);
      }).toThrow('Project data not found');
    });
  });

  describe('error handling', () => {
    it('should log generation start', () => {
      const mockLog = jest.spyOn(Logger.prototype, 'log');

      service.startGeneration({
        projectName: 'test-project',
        features: [],
        architecture: 'monolith',
        config: {},
      });

      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Starting generation'));
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('test-project'));
    });

    it('should log successful completion', async () => {
      const mockLog = jest.spyOn(Logger.prototype, 'log');
      generationService.generateProject.mockResolvedValue(Buffer.from('test'));

      service.startGeneration({
        projectName: 'test',
        features: [],
        architecture: 'monolith',
        config: {},
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('completed successfully'));
    });

    it('should log errors', async () => {
      const mockError = jest.spyOn(Logger.prototype, 'error');
      const testError = new Error('Test error');
      generationService.generateProject.mockRejectedValue(testError);

      service.startGeneration({
        projectName: 'test',
        features: [],
        architecture: 'monolith',
        config: {},
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockError).toHaveBeenCalledWith(expect.stringContaining('failed'), testError.stack);
    });
  });
});
