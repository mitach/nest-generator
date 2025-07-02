import { GenerationError, getErrorMessage, getErrorSolution, ErrorResponse } from './errors';

describe('Error Types', () => {
  describe('GenerationError', () => {
    it('should create error with response data', () => {
      const errorResponse: ErrorResponse = {
        message: 'Test error',
        code: 'TEST_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
        details: { test: 'data' },
      };

      const error = new GenerationError(errorResponse, 400);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.response).toEqual(errorResponse);
      expect(error.httpStatus).toBe(400);
      expect(error.details).toEqual({ test: 'data' });
      expect(error.name).toBe('GenerationError');
    });

    it('should create error without http status', () => {
      const errorResponse: ErrorResponse = {
        message: 'Test error',
        code: 'TEST_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const error = new GenerationError(errorResponse);

      expect(error.httpStatus).toBeUndefined();
    });

    it('should handle undefined details', () => {
      const errorResponse: ErrorResponse = {
        message: 'Test error',
        code: 'TEST_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const error = new GenerationError(errorResponse);

      expect(error.details).toBeUndefined();
    });
  });

  describe('getErrorMessage', () => {
    it('should return user-friendly message for VALIDATION_ERROR', () => {
      const error: ErrorResponse = {
        message: 'Invalid project name',
        code: 'VALIDATION_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const message = getErrorMessage(error);
      expect(message).toBe('Project configuration is invalid: Invalid project name');
    });

    it('should return detailed message for TEMPLATE_ERROR with template path', () => {
      const error: ErrorResponse = {
        message: 'Syntax error',
        code: 'TEMPLATE_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
        details: { templatePath: '/templates/auth.hbs' },
      };

      const message = getErrorMessage(error);
      expect(message).toBe('Template error in /templates/auth.hbs: Syntax error');
    });

    it('should return generic template message without path', () => {
      const error: ErrorResponse = {
        message: 'Syntax error',
        code: 'TEMPLATE_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const message = getErrorMessage(error);
      expect(message).toBe('Template processing failed: Syntax error');
    });

    it('should return detailed message for FILESYSTEM_ERROR with file path', () => {
      const error: ErrorResponse = {
        message: 'Permission denied',
        code: 'FILESYSTEM_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
        details: { filePath: '/tmp/test.ts' },
      };

      const message = getErrorMessage(error);
      expect(message).toBe('File operation failed for /tmp/test.ts: Permission denied');
    });

    it('should return detailed message for DEPENDENCY_ERROR with dependency', () => {
      const error: ErrorResponse = {
        message: 'Package not found',
        code: 'DEPENDENCY_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
        details: { dependency: '@nestjs/jwt' },
      };

      const message = getErrorMessage(error);
      expect(message).toBe('Dependency issue with @nestjs/jwt: Package not found');
    });

    it('should return detailed message for FEATURE_NOT_FOUND', () => {
      const error: ErrorResponse = {
        message: 'Feature not found',
        code: 'FEATURE_NOT_FOUND',
        timestamp: '2024-01-01T00:00:00.000Z',
        details: { featureName: 'auth:jwt', architecture: 'monolith' },
      };

      const message = getErrorMessage(error);
      expect(message).toBe('Feature "auth:jwt" is not available for monolith projects');
    });

    it('should handle FEATURE_NOT_FOUND without details', () => {
      const error: ErrorResponse = {
        message: 'Feature not found',
        code: 'FEATURE_NOT_FOUND',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const message = getErrorMessage(error);
      expect(message).toBe('Feature "undefined" is not available for undefined projects');
    });

    it('should return specific messages for standard codes', () => {
      const testCases = [
        {
          code: 'GENERATION_NOT_FOUND',
          expected: 'Generation session not found. Please try generating again.',
        },
        {
          code: 'PROJECT_NOT_READY',
          expected: 'Project is still being generated. Please wait...',
        },
        {
          code: 'PROJECT_DATA_MISSING',
          expected: 'Generated project data is missing. Please try again.',
        },
      ];

      testCases.forEach(({ code, expected }) => {
        const error: ErrorResponse = {
          message: 'Original message',
          code,
          timestamp: '2024-01-01T00:00:00.000Z',
        };

        const message = getErrorMessage(error);
        expect(message).toBe(expected);
      });
    });

    it('should return original message for unknown error codes', () => {
      const error: ErrorResponse = {
        message: 'Unknown error occurred',
        code: 'UNKNOWN_CODE',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const message = getErrorMessage(error);
      expect(message).toBe('Unknown error occurred');
    });

    it('should return fallback message for empty message', () => {
      const error: ErrorResponse = {
        message: '',
        code: 'UNKNOWN_CODE',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const message = getErrorMessage(error);
      expect(message).toBe('An unexpected error occurred');
    });
  });

  describe('getErrorSolution', () => {
    it('should return solution for VALIDATION_ERROR', () => {
      const error: ErrorResponse = {
        message: 'Invalid config',
        code: 'VALIDATION_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const solution = getErrorSolution(error);
      expect(solution).toBe('Please check your project configuration and try again.');
    });

    it('should return solution for FEATURE_NOT_FOUND', () => {
      const error: ErrorResponse = {
        message: 'Feature not found',
        code: 'FEATURE_NOT_FOUND',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const solution = getErrorSolution(error);
      expect(solution).toBe(
        'This feature may not be supported yet. Try selecting different features.',
      );
    });

    it('should return solution for TEMPLATE_ERROR', () => {
      const error: ErrorResponse = {
        message: 'Template failed',
        code: 'TEMPLATE_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const solution = getErrorSolution(error);
      expect(solution).toBe(
        'There might be an issue with the template. Please try with different configuration.',
      );
    });

    it('should return solution for DEPENDENCY_ERROR', () => {
      const error: ErrorResponse = {
        message: 'Package not found',
        code: 'DEPENDENCY_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const solution = getErrorSolution(error);
      expect(solution).toBe('Please check your internet connection and try again.');
    });

    it('should return solution for GENERATION_NOT_FOUND', () => {
      const error: ErrorResponse = {
        message: 'Not found',
        code: 'GENERATION_NOT_FOUND',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const solution = getErrorSolution(error);
      expect(solution).toBe('Click "Generate & Download" to start a new generation.');
    });

    it('should return solution for PROJECT_NOT_READY', () => {
      const error: ErrorResponse = {
        message: 'Not ready',
        code: 'PROJECT_NOT_READY',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const solution = getErrorSolution(error);
      expect(solution).toBe('The generation is in progress. Please wait a moment.');
    });

    it('should return null for unknown error codes', () => {
      const error: ErrorResponse = {
        message: 'Unknown error',
        code: 'UNKNOWN_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const solution = getErrorSolution(error);
      expect(solution).toBeNull();
    });

    it('should return null for codes without solutions', () => {
      const error: ErrorResponse = {
        message: 'File error',
        code: 'FILESYSTEM_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const solution = getErrorSolution(error);
      expect(solution).toBeNull();
    });
  });
});
