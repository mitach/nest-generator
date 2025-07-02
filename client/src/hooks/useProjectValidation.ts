import { useMemo } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useMonolithStore } from '@/store/monolithStore';
import { ProjectValidationConfig, ValidationResult } from '@/lib/validation/validation.types';
import { ProjectValidationService } from '@/lib/validation/validation.service';

export const useProjectValidation = (): ValidationResult & {
  validateField: (field: keyof ProjectValidationConfig) => ValidationResult;
  config: ProjectValidationConfig;
} => {
  const { projectName, architecture, getProjectConfig } = useProjectStore();
  const { monolithFeatures } = useMonolithStore();

  const config = useMemo((): ProjectValidationConfig => {
    const projectConfig = getProjectConfig();

    return {
      projectName,
      architecture,
      features: architecture === 'monolith' ? monolithFeatures : [],
      config: projectConfig.featureConfigs,
    };
  }, [projectName, architecture, monolithFeatures, getProjectConfig]);

  const validation = useMemo(() => {
    return ProjectValidationService.validateConfiguration(config);
  }, [config]);

  const validateField = useMemo(() => {
    return (field: keyof ProjectValidationConfig) => {
      return ProjectValidationService.validateField(config, field);
    };
  }, [config]);

  return {
    ...validation,
    validateField,
    config,
  };
};
