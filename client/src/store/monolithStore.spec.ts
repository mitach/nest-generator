import { useMonolithStore } from './monolithStore';
import { useProjectStore } from './projectStore';
import { act, renderHook } from '@testing-library/react';

jest.mock('./projectStore');
const mockUseProjectStore = useProjectStore as jest.MockedFunction<typeof useProjectStore>;

describe('MonolithStore', () => {
  let mockProjectStore: {
    removeFeatureConfig: jest.Mock;
    getProjectConfig: jest.Mock;
  };

  beforeEach(() => {
    useMonolithStore.setState({
      monolithFeatures: [],
    });

    mockProjectStore = {
      removeFeatureConfig: jest.fn(),
      getProjectConfig: jest.fn().mockReturnValue({
        projectName: 'test-project',
        architecture: 'monolith',
        featureConfigs: {},
      }),
    };

    mockUseProjectStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({
          getState: () => mockProjectStore,
        } as any);
      }
      return mockProjectStore;
    });

    (useProjectStore as any).getState = jest.fn().mockReturnValue(mockProjectStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty features array initially', () => {
      const { result } = renderHook(() => useMonolithStore());

      expect(result.current.monolithFeatures).toEqual([]);
    });
  });

  describe('setMonolithFeatures', () => {
    it('should set all features at once', () => {
      const { result } = renderHook(() => useMonolithStore());
      const features = ['cors', 'validation', 'auth'];

      act(() => {
        result.current.setMonolithFeatures(features);
      });

      expect(result.current.monolithFeatures).toEqual(features);
    });

    it('should replace existing features', () => {
      const { result } = renderHook(() => useMonolithStore());

      act(() => {
        result.current.setMonolithFeatures(['cors', 'auth']);
        result.current.setMonolithFeatures(['validation', 'swagger']);
      });

      expect(result.current.monolithFeatures).toEqual(['validation', 'swagger']);
    });

    it('should handle empty array', () => {
      const { result } = renderHook(() => useMonolithStore());

      act(() => {
        result.current.setMonolithFeatures(['cors']);
        result.current.setMonolithFeatures([]);
      });

      expect(result.current.monolithFeatures).toEqual([]);
    });
  });

  describe('addFeature', () => {
    it('should add new feature', () => {
      const { result } = renderHook(() => useMonolithStore());

      act(() => {
        result.current.addFeature('cors');
      });

      expect(result.current.monolithFeatures).toEqual(['cors']);
    });

    it('should add multiple features', () => {
      const { result } = renderHook(() => useMonolithStore());

      act(() => {
        result.current.addFeature('cors');
        result.current.addFeature('validation');
        result.current.addFeature('auth');
      });

      expect(result.current.monolithFeatures).toEqual(['cors', 'validation', 'auth']);
    });

    it('should not add duplicate features', () => {
      const { result } = renderHook(() => useMonolithStore());

      act(() => {
        result.current.addFeature('cors');
        result.current.addFeature('cors');
        result.current.addFeature('cors');
      });

      expect(result.current.monolithFeatures).toEqual(['cors']);
    });

    it('should maintain order when adding features', () => {
      const { result } = renderHook(() => useMonolithStore());

      act(() => {
        result.current.addFeature('cors');
        result.current.addFeature('validation');
        result.current.addFeature('cors'); // duplicate
        result.current.addFeature('auth');
      });

      expect(result.current.monolithFeatures).toEqual(['cors', 'validation', 'auth']);
    });
  });

  describe('removeFeature', () => {
    it('should remove existing feature', () => {
      const { result } = renderHook(() => useMonolithStore());

      act(() => {
        result.current.setMonolithFeatures(['cors', 'validation', 'auth']);
        result.current.removeFeature('validation');
      });

      expect(result.current.monolithFeatures).toEqual(['cors', 'auth']);
    });

    it('should handle removing non-existing feature', () => {
      const { result } = renderHook(() => useMonolithStore());

      act(() => {
        result.current.setMonolithFeatures(['cors', 'auth']);
        result.current.removeFeature('non-existing');
      });

      expect(result.current.monolithFeatures).toEqual(['cors', 'auth']);
    });

    it('should remove feature config from projectStore', () => {
      const { result } = renderHook(() => useMonolithStore());

      act(() => {
        result.current.setMonolithFeatures(['cors']);
        result.current.removeFeature('cors');
      });

      expect(mockProjectStore.removeFeatureConfig).toHaveBeenCalledWith('cors');
    });

    it('should handle removing from empty array', () => {
      const { result } = renderHook(() => useMonolithStore());

      act(() => {
        result.current.removeFeature('cors');
      });

      expect(result.current.monolithFeatures).toEqual([]);
      expect(mockProjectStore.removeFeatureConfig).toHaveBeenCalledWith('cors');
    });
  });

  describe('generateMonolithConfig', () => {
    it('should generate config with current features', () => {
      const { result } = renderHook(() => useMonolithStore());

      mockProjectStore.getProjectConfig.mockReturnValue({
        projectName: 'test-project',
        architecture: 'monolith',
        featureConfigs: {
          cors: { origin: '*' },
          auth: { jwt: true },
        },
      });

      act(() => {
        result.current.setMonolithFeatures(['cors', 'validation', 'auth']);
      });

      const config = result.current.generateMonolithConfig();

      expect(config).toEqual({
        projectName: 'test-project',
        architecture: 'monolith',
        features: ['cors', 'validation', 'auth'],
        config: {
          cors: { origin: '*' },
          auth: { jwt: true },
        },
      });
    });

    it('should generate config with empty features', () => {
      const { result } = renderHook(() => useMonolithStore());

      mockProjectStore.getProjectConfig.mockReturnValue({
        projectName: 'empty-project',
        architecture: 'monolith',
        featureConfigs: {},
      });

      const config = result.current.generateMonolithConfig();

      expect(config).toEqual({
        projectName: 'empty-project',
        architecture: 'monolith',
        features: [],
        config: {},
      });
    });

    it('should call projectStore.getProjectConfig', () => {
      const { result } = renderHook(() => useMonolithStore());

      result.current.generateMonolithConfig();

      expect(mockProjectStore.getProjectConfig).toHaveBeenCalled();
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple operations in sequence', () => {
      const { result } = renderHook(() => useMonolithStore());

      act(() => {
        result.current.addFeature('cors');
        result.current.addFeature('validation');
        result.current.addFeature('auth');
        result.current.removeFeature('validation');
        result.current.addFeature('swagger');
        result.current.removeFeature('cors');
      });

      expect(result.current.monolithFeatures).toEqual(['auth', 'swagger']);
      expect(mockProjectStore.removeFeatureConfig).toHaveBeenCalledWith('validation');
      expect(mockProjectStore.removeFeatureConfig).toHaveBeenCalledWith('cors');
      expect(mockProjectStore.removeFeatureConfig).toHaveBeenCalledTimes(2);
    });

    it('should preserve feature order', () => {
      const { result } = renderHook(() => useMonolithStore());

      act(() => {
        result.current.addFeature('z-feature');
        result.current.addFeature('a-feature');
        result.current.addFeature('m-feature');
      });

      expect(result.current.monolithFeatures).toEqual(['z-feature', 'a-feature', 'm-feature']);
    });
  });
});
