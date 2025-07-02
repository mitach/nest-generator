import {
  GenerationError,
  ValidationError,
  TemplateError,
  FileSystemError,
  DependencyError,
  FeatureNotFoundError,
} from './generation.errors';
import { createErrorResponse } from './index';

describe('GenerationErrors', () => {
  describe('GenerationError', () => {
    it('should create error with correct properties', () => {
      const error = new GenerationError('Test message', 'TEST_CODE', { test: 'data' });

      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ test: 'data' });
      expect(error.name).toBe('GenerationError');
      expect(error).toBeInstanceOf(Error);
    });

    it('should create error without details', () => {
      const error = new GenerationError('Test message', 'TEST_CODE');

      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toBeUndefined();
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with correct properties', () => {
      const error = new ValidationError('Invalid config', { field: 'projectName' });

      expect(error.message).toBe('Invalid config');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual({ field: 'projectName' });
      expect(error.name).toBe('ValidationError');
      expect(error).toBeInstanceOf(GenerationError);
    });

    it('should create validation error without details', () => {
      const error = new ValidationError('Invalid config');

      expect(error.details).toBeUndefined();
    });
  });

  describe('TemplateError', () => {
    it('should create template error with path', () => {
      const error = new TemplateError('Template failed', '/path/to/template.hbs', { line: 5 });

      expect(error.message).toBe('Template failed');
      expect(error.code).toBe('TEMPLATE_ERROR');
      expect(error.details).toEqual({ templatePath: '/path/to/template.hbs', line: 5 });
      expect(error.name).toBe('TemplateError');
    });

    it('should create template error without path', () => {
      const error = new TemplateError('Template failed');

      expect(error.details).toEqual({ templatePath: undefined });
    });
  });

  describe('FileSystemError', () => {
    it('should create filesystem error with file path', () => {
      const error = new FileSystemError('File not found', '/path/to/file.ts', { errno: -2 });

      expect(error.message).toBe('File not found');
      expect(error.code).toBe('FILESYSTEM_ERROR');
      expect(error.details).toEqual({ filePath: '/path/to/file.ts', errno: -2 });
      expect(error.name).toBe('FileSystemError');
    });
  });

  describe('DependencyError', () => {
    it('should create dependency error with package name', () => {
      const error = new DependencyError('Package not found', '@nestjs/jwt', { version: '^11.0.0' });

      expect(error.message).toBe('Package not found');
      expect(error.code).toBe('DEPENDENCY_ERROR');
      expect(error.details).toEqual({ dependency: '@nestjs/jwt', version: '^11.0.0' });
      expect(error.name).toBe('DependencyError');
    });
  });

  describe('FeatureNotFoundError', () => {
    it('should create feature not found error with correct message', () => {
      const error = new FeatureNotFoundError('auth:jwt', 'monolith');

      expect(error.message).toBe('Feature "auth:jwt" not found for monolith architecture');
      expect(error.code).toBe('FEATURE_NOT_FOUND');
      expect(error.details).toEqual({
        featureName: 'auth:jwt',
        architecture: 'monolith',
      });
      expect(error.name).toBe('FeatureNotFoundError');
    });

    it('should handle empty feature name', () => {
      const error = new FeatureNotFoundError('', 'microservice');

      expect(error.message).toBe('Feature "" not found for microservice architecture');
      expect(error.details.featureName).toBe('');
      expect(error.details.architecture).toBe('microservice');
    });
  });
});

describe('createErrorResponse', () => {
  beforeEach(() => {
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-01T00:00:00.000Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create error response from GenerationError', () => {
    const error = new ValidationError('Invalid config', { field: 'projectName' });
    const response = createErrorResponse(error, '/api/test');

    expect(response).toEqual({
      message: 'Invalid config',
      code: 'VALIDATION_ERROR',
      details: { field: 'projectName' },
      timestamp: '2024-01-01T00:00:00.000Z',
      path: '/api/test',
    });
  });

  it('should create error response without path', () => {
    const error = new TemplateError('Template failed');
    const response = createErrorResponse(error);

    expect(response.path).toBeUndefined();
    expect(response.code).toBe('TEMPLATE_ERROR');
  });

  it('should handle regular Error objects', () => {
    const error = new Error('Regular error');
    const response = createErrorResponse(error, '/api/test');

    expect(response).toEqual({
      message: 'Regular error',
      code: 'UNKNOWN_ERROR',
      details: undefined,
      timestamp: '2024-01-01T00:00:00.000Z',
      path: '/api/test',
    });
  });

  it('should handle error without message', () => {
    const error = new Error();
    const response = createErrorResponse(error);

    expect(response.message).toBe('An unexpected error occurred');
    expect(response.code).toBe('UNKNOWN_ERROR');
  });

  it('should handle non-Error objects', () => {
    const error = { message: 'Custom error' } as Error;
    const response = createErrorResponse(error);

    expect(response.message).toBe('Custom error');
    expect(response.code).toBe('UNKNOWN_ERROR');
  });
});
