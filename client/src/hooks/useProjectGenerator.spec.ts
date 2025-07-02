/**
 * @jest-environment node
 */

jest.mock('../store/apiServiceStore', () => ({
  useApiServiceStore: jest.fn(),
}));

jest.mock('react-hot-toast', () => jest.fn());

jest.mock('react', () => ({
  useState: jest.fn(),
  useCallback: jest.fn(),
}));

import React from 'react';
import { useProjectGenerator } from './useProjectGenerator';
import { GenerationError } from '@/lib/errors';
import toast from 'react-hot-toast';
import { useApiServiceStore } from '../store/apiServiceStore';

const mockReact = React as jest.Mocked<typeof React>;
const mockToast = toast as jest.MockedFunction<any>;
const mockServiceStore = useApiServiceStore as jest.MockedFunction<any>;

describe('useProjectGenerator - Logic Tests', () => {
  let mockAPI: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAPI = {
      generateProject: jest.fn(),
      checkStatus: jest.fn(),
      downloadProject: jest.fn(),
    };

    mockServiceStore.mockReturnValue(mockAPI);

    let loadingState = false;
    const setLoading = jest.fn((value) => {
      loadingState = value;
    });

    mockReact.useState.mockReturnValue([loadingState, setLoading]);
    mockReact.useCallback.mockImplementation((fn) => fn);

    mockToast.loading = jest.fn(() => 'mock-id');
    mockToast.success = jest.fn(() => 'mock-id');
    mockToast.error = jest.fn(() => 'mock-id');

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Initialization', () => {
    it('should be a function', () => {
      expect(typeof useProjectGenerator).toBe('function');
    });

    it('should have correct dependencies mocked', () => {
      expect(mockAPI.generateProject).toBeDefined();
      expect(mockAPI.checkStatus).toBeDefined();
      expect(mockAPI.downloadProject).toBeDefined();
      expect(mockToast.loading).toBeDefined();
      expect(mockToast.success).toBeDefined();
      expect(mockToast.error).toBeDefined();
    });
  });

  describe('API Integration', () => {
    it('should call generateProject with correct config', async () => {
      mockAPI.generateProject.mockResolvedValue({ generationId: 'test-id' });
      mockAPI.checkStatus.mockResolvedValue({
        status: 'completed',
        downloadUrl: '/download/test',
      });
      mockAPI.downloadProject.mockResolvedValue(new Blob(['test']));

      const mockConfig = {
        projectName: 'test-project',
        architecture: 'monolith',
        features: ['cors'],
      };

      const result = useProjectGenerator('test-project');
      await result.handleGenerateProject(mockConfig);

      expect(mockAPI.generateProject).toHaveBeenCalledWith(mockConfig);
    });

    it('should handle generateProject errors', async () => {
      const errorResponse = {
        message: 'Invalid project name',
        code: 'VALIDATION_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      mockAPI.generateProject.mockRejectedValue(new GenerationError(errorResponse));

      const result = useProjectGenerator('test-project');
      await result.handleGenerateProject({
        projectName: 'test',
        architecture: 'monolith',
        features: [],
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining('Project configuration is invalid'),
        expect.objectContaining({ duration: 8000 }),
      );
    });

    it('should handle network errors', async () => {
      mockAPI.generateProject.mockRejectedValue(new Error('Network error'));

      const result = useProjectGenerator('test-project');
      await result.handleGenerateProject({
        projectName: 'test',
        architecture: 'monolith',
        features: [],
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to start project generation'),
        expect.any(Object),
      );
    });
  });

  describe('Status Polling', () => {
    it('should handle failed status', async () => {
      const errorResponse = {
        message: 'Feature not found',
        code: 'FEATURE_NOT_FOUND',
        timestamp: '2024-01-01T00:00:00.000Z',
        details: { featureName: 'unknown-feature', architecture: 'monolith' },
      };

      mockAPI.generateProject.mockResolvedValue({ generationId: 'test-id' });
      mockAPI.checkStatus.mockResolvedValue({
        status: 'failed',
        error: errorResponse,
      });

      const result = useProjectGenerator('test-project');
      await result.handleGenerateProject({
        projectName: 'test',
        architecture: 'monolith',
        features: [],
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining('Feature "unknown-feature" is not available for monolith projects'),
        expect.objectContaining({ duration: 8000 }),
      );
    });

    it('should handle status check errors', async () => {
      mockAPI.generateProject.mockResolvedValue({ generationId: 'test-id' });
      mockAPI.checkStatus.mockRejectedValue(new Error('Status check failed'));

      const result = useProjectGenerator('test-project');
      await result.handleGenerateProject({
        projectName: 'test',
        architecture: 'monolith',
        features: [],
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to check generation status'),
        expect.objectContaining({ duration: 6000 }),
      );
    });
  });

  describe('Download Functionality', () => {
    beforeEach(() => {
      Object.defineProperty(global, 'URL', {
        value: { createObjectURL: jest.fn(() => 'blob:mock-url') },
        writable: true,
      });

      Object.defineProperty(global, 'document', {
        value: {
          createElement: jest.fn(() => ({
            href: '',
            download: '',
            click: jest.fn(),
          })),
        },
        writable: true,
      });
    });

    it('should create download with correct filename', async () => {
      mockAPI.generateProject.mockResolvedValue({ generationId: 'test-id' });
      mockAPI.checkStatus.mockResolvedValue({
        status: 'completed',
        downloadUrl: '/download/test',
      });
      mockAPI.downloadProject.mockResolvedValue(new Blob(['test content']));

      const mockLink = { href: '', download: '', click: jest.fn() };
      (global.document.createElement as jest.Mock).mockReturnValue(mockLink);

      const result = useProjectGenerator('my-awesome-project');
      await result.handleGenerateProject({
        projectName: 'test',
        architecture: 'monolith',
        features: [],
      });

      expect(mockLink.download).toBe('my-awesome-project.zip');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should handle download errors', async () => {
      mockAPI.generateProject.mockResolvedValue({ generationId: 'test-id' });
      mockAPI.checkStatus.mockResolvedValue({
        status: 'completed',
        downloadUrl: '/download/test',
      });

      const downloadError = new GenerationError({
        message: 'Download failed',
        code: 'DOWNLOAD_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
      });

      mockAPI.downloadProject.mockRejectedValue(downloadError);

      const result = useProjectGenerator('test-project');
      await result.handleGenerateProject({
        projectName: 'test',
        architecture: 'monolith',
        features: [],
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining('Download failed'),
        expect.any(Object),
      );
    });
  });

  describe('Toast Messages', () => {
    it('should show appropriate toast messages during successful flow', async () => {
      mockAPI.generateProject.mockResolvedValue({ generationId: 'test-id' });
      mockAPI.checkStatus.mockResolvedValue({
        status: 'completed',
        downloadUrl: '/download/test',
      });
      mockAPI.downloadProject.mockResolvedValue(new Blob(['test']));

      const result = useProjectGenerator('test-project');
      await result.handleGenerateProject({
        projectName: 'test',
        architecture: 'monolith',
        features: [],
      });

      expect(mockToast.loading).toHaveBeenCalledWith('Starting project generation...');
    });
  });
});
