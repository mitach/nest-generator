import { useProjectStore } from './projectStore';
import { act, renderHook } from '@testing-library/react';

describe('ProjectStore', () => {
  beforeEach(() => {
    // Очищаем store перед каждым тестом
    useProjectStore.setState({
      projectName: 'my-nestjs-app',
      architecture: 'monolith',
      featureConfigs: {},
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useProjectStore());

      expect(result.current.projectName).toBe('my-nestjs-app');
      expect(result.current.architecture).toBe('monolith');
      expect(result.current.featureConfigs).toEqual({});
    });
  });

  describe('setProjectName', () => {
    it('should update project name', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.setProjectName('new-project');
      });

      expect(result.current.projectName).toBe('new-project');
    });

    it('should handle empty string', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.setProjectName('');
      });

      expect(result.current.projectName).toBe('');
    });

    it('should handle special characters', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.setProjectName('my-project-123_test');
      });

      expect(result.current.projectName).toBe('my-project-123_test');
    });
  });

  describe('setArchitecture', () => {
    it('should update architecture to microservice', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.setArchitecture('microservice');
      });

      expect(result.current.architecture).toBe('microservice');
    });

    it('should update architecture to monolith', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.setArchitecture('microservice');
        result.current.setArchitecture('monolith');
      });

      expect(result.current.architecture).toBe('monolith');
    });
  });

  describe('setFeatureConfig', () => {
    it('should add new feature config', () => {
      const { result } = renderHook(() => useProjectStore());
      const config = { corsOptions: { origin: ['http://localhost:3000'] } };

      act(() => {
        result.current.setFeatureConfig('cors', config);
      });

      expect(result.current.featureConfigs).toEqual({
        cors: config,
      });
    });

    it('should update existing feature config', () => {
      const { result } = renderHook(() => useProjectStore());
      const initialConfig = { corsOptions: { origin: ['*'] } };
      const updatedConfig = { corsOptions: { origin: ['http://localhost:3000'] } };

      act(() => {
        result.current.setFeatureConfig('cors', initialConfig);
        result.current.setFeatureConfig('cors', updatedConfig);
      });

      expect(result.current.featureConfigs.cors).toEqual(updatedConfig);
    });

    it('should handle multiple feature configs', () => {
      const { result } = renderHook(() => useProjectStore());
      const corsConfig = { corsOptions: { origin: ['*'] } };
      const userConfig = { userFields: [{ name: 'email', type: 'string' }] };

      act(() => {
        result.current.setFeatureConfig('cors', corsConfig);
        result.current.setFeatureConfig('users', userConfig);
      });

      expect(result.current.featureConfigs).toEqual({
        cors: corsConfig,
        users: userConfig,
      });
    });

    it('should handle complex nested config', () => {
      const { result } = renderHook(() => useProjectStore());
      const complexConfig = {
        database: {
          type: 'mongodb',
          options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          },
        },
        auth: {
          strategies: ['jwt', 'google'],
          jwt: {
            secret: 'test-secret',
            expiration: '15m',
          },
        },
      };

      act(() => {
        result.current.setFeatureConfig('auth', complexConfig);
      });

      expect(result.current.featureConfigs.auth).toEqual(complexConfig);
    });
  });

  describe('updateFeatureConfigs', () => {
    it('should replace all feature configs', () => {
      const { result } = renderHook(() => useProjectStore());

      // Устанавливаем начальные конфиги
      act(() => {
        result.current.setFeatureConfig('cors', { origin: '*' });
        result.current.setFeatureConfig('auth', { jwt: true });
      });

      const newConfigs = {
        validation: { enableImplicitConversion: true },
        swagger: { title: 'My API' },
      };

      act(() => {
        result.current.updateFeatureConfigs(newConfigs);
      });

      expect(result.current.featureConfigs).toEqual(newConfigs);
    });

    it('should handle empty configs object', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.setFeatureConfig('cors', { origin: '*' });
        result.current.updateFeatureConfigs({});
      });

      expect(result.current.featureConfigs).toEqual({});
    });
  });

  describe('removeFeatureConfig', () => {
    it('should remove existing feature config', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.setFeatureConfig('cors', { origin: '*' });
        result.current.setFeatureConfig('auth', { jwt: true });
        result.current.removeFeatureConfig('cors');
      });

      expect(result.current.featureConfigs).toEqual({
        auth: { jwt: true },
      });
    });

    it('should handle removing non-existing feature', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.setFeatureConfig('auth', { jwt: true });
        result.current.removeFeatureConfig('non-existing');
      });

      expect(result.current.featureConfigs).toEqual({
        auth: { jwt: true },
      });
    });

    it('should handle removing from empty configs', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.removeFeatureConfig('cors');
      });

      expect(result.current.featureConfigs).toEqual({});
    });
  });

  describe('getProjectConfig', () => {
    it('should return complete project configuration', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.setProjectName('test-project');
        result.current.setArchitecture('microservice');
        result.current.setFeatureConfig('cors', { origin: ['*'] });
        result.current.setFeatureConfig('auth', { jwt: { secret: 'test' } });
      });

      const config = result.current.getProjectConfig();

      expect(config).toEqual({
        projectName: 'test-project',
        architecture: 'microservice',
        featureConfigs: {
          cors: { origin: ['*'] },
          auth: { jwt: { secret: 'test' } },
        },
      });
    });

    it('should return config with empty feature configs', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.setProjectName('empty-project');
        result.current.setArchitecture('monolith');
      });

      const config = result.current.getProjectConfig();

      expect(config).toEqual({
        projectName: 'empty-project',
        architecture: 'monolith',
        featureConfigs: {},
      });
    });
  });

  describe('state persistence', () => {
    it('should maintain state across multiple operations', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.setProjectName('multi-op-test');
        result.current.setArchitecture('microservice');
        result.current.setFeatureConfig('cors', { origin: '*' });
        result.current.setFeatureConfig('auth', { jwt: true });
        result.current.setProjectName('multi-op-test-updated');
        result.current.removeFeatureConfig('cors');
      });

      expect(result.current.projectName).toBe('multi-op-test-updated');
      expect(result.current.architecture).toBe('microservice');
      expect(result.current.featureConfigs).toEqual({
        auth: { jwt: true },
      });
    });
  });
});
