export interface PartialFileMeta {
  target: string;
  source: string;
  placeholders: string[];
  onlyIfFeatures?: string[];
}

export interface PendingPartial {
  tempDir: string;
  featurePath: string;
  partialFiles: Record<string, PartialFileMeta>;
  featureName: string;
  architecture: string;
  config: Record<string, unknown>;
  allFeatures: string[];
}

export interface FeatureConfig {
  dependencyGroups?: string[];
  dependencyPresets?: string[];
  customDependencies?: Record<string, string>;
  customDevDependencies?: Record<string, string>;
  requires?: string[];
  copyFiles?: Array<{ source: string; target: string; processTemplate?: boolean }>;
  partialFiles?: Record<string, PartialFileMeta>;
  updateAppModule?: boolean;
}

export interface ServiceDefinition {
  features: string[];
  config?: Record<string, unknown>;
}

export interface MonolithProjectData {
  projectName: string;
  features: string[];
  config?: Record<string, unknown>;
}

export interface MicroserviceProjectData {
  projectName: string;
  services: Record<string, ServiceDefinition>;
  config?: Record<string, unknown>;
}

export type GenerateProjectData = MonolithProjectData | MicroserviceProjectData;
