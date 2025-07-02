import { create } from 'zustand';
import { useProjectStore } from '@/store/projectStore';

interface MonolithStore {
  // State
  monolithFeatures: string[];

  // Actions
  setMonolithFeatures: (features: string[]) => void;
  addFeature: (feature: string) => void;
  removeFeature: (feature: string) => void;

  // Computed/Helper methods
  generateMonolithConfig: () => Record<string, unknown>;
}

export const useMonolithStore = create<MonolithStore>((set, get) => ({
  // Initial state
  monolithFeatures: [],

  // Actions
  setMonolithFeatures: (features) => set({ monolithFeatures: features }),

  addFeature: (feature) =>
    set((state) => ({
      monolithFeatures: state.monolithFeatures.includes(feature)
        ? state.monolithFeatures
        : [...state.monolithFeatures, feature],
    })),

  removeFeature: (feature) => {
    set((state) => ({
      monolithFeatures: state.monolithFeatures.filter((f) => f !== feature),
    }));

    useProjectStore.getState().removeFeatureConfig(feature);
  },

  // Helper methods
  generateMonolithConfig: () => {
    const projectConfig = useProjectStore.getState().getProjectConfig();

    return {
      projectName: projectConfig.projectName,
      architecture: 'monolith',
      features: get().monolithFeatures,
      config: projectConfig.featureConfigs,
    };
  },
}));
