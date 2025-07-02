import { create } from 'zustand';

export type Architecture = 'monolith' | 'microservice';

interface ProjectStore {
  // State
  projectName: string;
  architecture: Architecture;
  featureConfigs: Record<string, unknown>;

  // Actions
  setProjectName: (name: string) => void;
  setArchitecture: (arch: Architecture) => void;
  setFeatureConfig: (featureName: string, config: unknown) => void;
  updateFeatureConfigs: (configs: Record<string, unknown>) => void;
  removeFeatureConfig: (featureName: string) => void;

  // Computed/Helper methods
  getProjectConfig: () => {
    projectName: string;
    architecture: Architecture;
    featureConfigs: Record<string, unknown>;
  };
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  // Initial state
  projectName: 'my-nestjs-app',
  architecture: 'monolith',
  featureConfigs: {},

  // Actions
  setProjectName: (name) => set({ projectName: name }),

  setArchitecture: (arch) => set({ architecture: arch }),

  setFeatureConfig: (featureName, config) =>
    set((state) => ({
      featureConfigs: {
        ...state.featureConfigs,
        [featureName]: config,
      },
    })),

  updateFeatureConfigs: (configs) => set({ featureConfigs: configs }),

  removeFeatureConfig: (featureName) =>
    set((state) => {
      const { [featureName]: _, ...remainingConfigs } = state.featureConfigs;
      return { featureConfigs: remainingConfigs };
    }),

  // Helper methods
  getProjectConfig: () => {
    const state = get();
    return {
      projectName: state.projectName,
      architecture: state.architecture,
      featureConfigs: state.featureConfigs,
    };
  },
}));
