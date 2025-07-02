import { ProjectGeneratorAPI } from './project-generator';
import { GenerationError } from '@/lib/errors';

global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('ProjectGeneratorAPI', () => {
  let api: ProjectGeneratorAPI;
  const baseUrl = 'http://localhost:5000';

  beforeEach(() => {
    api = new ProjectGeneratorAPI(baseUrl);
    mockFetch.mockClear();
  });

  describe('generateProject', () => {
    const mockConfig = {
      projectName: 'test-project',
      architecture: 'monolith',
      features: ['cors', 'validation'],
    };

    it('should make POST request to /api/generate', async () => {
      const mockResponse = { generationId: 'test-id-123' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as unknown as Response);

      const result = await api.generateProject(mockConfig);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockConfig),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle 400 Bad Request with error response', async () => {
      const errorResponse = {
        message: 'Invalid project name',
        code: 'VALIDATION_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      } as unknown as Response);

      await expect(api.generateProject(mockConfig)).rejects.toThrow(GenerationError);

      try {
        await api.generateProject(mockConfig);
      } catch (error) {
        expect(error).toBeInstanceOf(GenerationError);
        expect((error as GenerationError).response).toEqual(errorResponse);
        expect((error as GenerationError).httpStatus).toBe(400);
      }
    });

    it('should handle non-JSON error response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Not JSON');
        },
      } as unknown as Response);

      await expect(api.generateProject(mockConfig)).rejects.toThrow(GenerationError);

      try {
        await api.generateProject(mockConfig);
      } catch (error) {
        expect((error as GenerationError).response.code).toBe('HTTP_ERROR');
        expect((error as GenerationError).response.message).toBe('Internal Server Error');
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(api.generateProject(mockConfig)).rejects.toThrow(GenerationError);

      try {
        await api.generateProject(mockConfig);
      } catch (error) {
        expect((error as GenerationError).response.code).toBe('NETWORK_ERROR');
        expect((error as GenerationError).response.message).toBe(
          'Failed to start project generation',
        );
      }
    });

    it('should re-throw GenerationError as-is', async () => {
      const originalError = new GenerationError({
        message: 'Test error',
        code: 'TEST_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
      });

      mockFetch.mockImplementation(() => {
        throw originalError;
      });

      await expect(api.generateProject(mockConfig)).rejects.toBe(originalError);
    });
  });

  describe('checkStatus', () => {
    const generationId = 'test-id-123';

    it('should make GET request to status endpoint', async () => {
      const mockResponse = {
        status: 'completed',
        downloadUrl: '/download/test',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as unknown as Response);

      const result = await api.checkStatus(generationId);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/generate/${generationId}/status`);
      expect(result).toEqual(mockResponse);
    });

    it('should handle pending status', async () => {
      const mockResponse = { status: 'pending' };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as unknown as Response);

      const result = await api.checkStatus(generationId);

      expect(result.status).toBe('pending');
      expect(result.downloadUrl).toBeUndefined();
      expect(result.error).toBeUndefined();
    });

    it('should handle failed status with error', async () => {
      const mockResponse = {
        status: 'failed',
        error: {
          message: 'Feature not found',
          code: 'FEATURE_NOT_FOUND',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as unknown as Response);

      const result = await api.checkStatus(generationId);

      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
      expect(result.error!.code).toBe('FEATURE_NOT_FOUND');
    });

    it('should handle 404 Not Found', async () => {
      const errorResponse = {
        message: 'Generation not found',
        code: 'GENERATION_NOT_FOUND',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => errorResponse,
      } as unknown as Response);

      await expect(api.checkStatus(generationId)).rejects.toThrow(GenerationError);
    });

    it('should include generationId in network error details', async () => {
      mockFetch.mockRejectedValue(new Error('Network timeout'));

      try {
        await api.checkStatus(generationId);
      } catch (error) {
        expect((error as GenerationError).response.details).toEqual({
          generationId,
          originalError: 'Network timeout',
        });
      }
    });
  });

  describe('downloadProject', () => {
    const downloadUrl = '/download/test-id-123';

    it('should make GET request to download endpoint', async () => {
      const mockBlob = new Blob(['test content']);

      mockFetch.mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      } as unknown as Response);

      const result = await api.downloadProject(downloadUrl);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}${downloadUrl}`);
      expect(result).toBe(mockBlob);
    });

    it('should handle download errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          message: 'File not found',
          code: 'FILE_NOT_FOUND',
          timestamp: '2024-01-01T00:00:00.000Z',
        }),
      } as unknown as Response);

      await expect(api.downloadProject(downloadUrl)).rejects.toThrow(GenerationError);
    });

    it('should include downloadUrl in error details', async () => {
      mockFetch.mockRejectedValue(new Error('Download failed'));

      try {
        await api.downloadProject(downloadUrl);
      } catch (error) {
        expect((error as GenerationError).response.details).toEqual({
          downloadUrl,
          originalError: 'Download failed',
        });
      }
    });

    it('should handle non-Error rejection', async () => {
      mockFetch.mockRejectedValue('String error');

      try {
        await api.downloadProject(downloadUrl);
      } catch (error) {
        expect((error as GenerationError).response.details.originalError).toBe('Unknown error');
      }
    });
  });

  describe('handleErrorResponse', () => {
    it('should parse JSON error response', async () => {
      const errorData = {
        message: 'Test error',
        code: 'TEST_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => errorData,
      } as unknown as Response;

      mockFetch.mockResolvedValue(mockResponse);

      try {
        await api.generateProject({});
      } catch (error) {
        expect((error as GenerationError).response).toEqual(errorData);
        expect((error as GenerationError).httpStatus).toBe(400);
      }
    });

    it('should handle non-JSON response', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Not JSON');
        },
      } as unknown as Response;

      mockFetch.mockResolvedValue(mockResponse);

      try {
        await api.generateProject({});
      } catch (error) {
        expect((error as GenerationError).response.code).toBe('HTTP_ERROR');
        expect((error as GenerationError).response.details.status).toBe(500);
      }
    });
  });
});
