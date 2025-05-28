import { useState, useCallback } from 'react';
import { Architecture, ProjectConfig } from '../types/project';

export const useProjectConfig = () => {
  const [projectName, setProjectName] = useState('my-nestjs-app');
  const [architecture, setArchitecture] = useState<Architecture | null>(null);
  const [monolithFeatures, setMonolithFeatures] = useState<string[]>([]);
  const [services, setServices] = useState<Record<string, { features: string[] }>>({});

  const getProjectConfig = useCallback((): ProjectConfig => {
    if (architecture === 'monolith') {
      return {
        projectName,
        architecture: 'monolith',
        features: monolithFeatures,
        config: {}
      };
    } else {
      return {
        projectName,
        architecture: 'microservice',
        services
      };
    }
  }, [projectName, architecture, monolithFeatures, services]);

  const toggleFeature = useCallback((feature: string, context: 'monolith' | string) => {
    if (context === 'monolith') {
      setMonolithFeatures(prev => 
        prev.includes(feature) 
          ? prev.filter(f => f !== feature)
          : [...prev, feature]
      );
    } else {
      setServices(prev => ({
        ...prev,
        [context]: {
          ...prev[context],
          features: prev[context]?.features.includes(feature)
            ? prev[context].features.filter(f => f !== feature)
            : [...(prev[context]?.features || []), feature]
        }
      }));
    }
  }, []);

  const addService = useCallback((serviceName: string) => {
    setServices(prev => {
      if (!prev[serviceName]) {
        return {
          ...prev,
          [serviceName]: { features: [] }
        };
      }
      return prev;
    });
  }, []);

  const removeService = useCallback((serviceName: string) => {
    setServices(prev => {
      const updated = { ...prev };
      delete updated[serviceName];
      return updated;
    });
  }, []);

  return {
    projectName,
    setProjectName,
    architecture,
    setArchitecture,
    monolithFeatures,
    services,
    getProjectConfig,
    toggleFeature,
    addService,
    removeService
  };
};