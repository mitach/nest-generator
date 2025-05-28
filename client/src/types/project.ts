export type Architecture = "monolith" | "microservice";
/* eslint-disable @typescript-eslint/no-explicit-any */
export type FeatureConfig = {
  id: string;
  name: string;
  available: boolean;
};

export type ServiceConfig = {
  id: string;
  name: string;
  available: boolean;
};

export type MonolithConfig = {
  projectName: string;
  architecture: "monolith";
  features: string[];
  config: Record<string, any>;
};

export type MicroserviceConfig = {
  projectName: string;
  architecture: "microservice";
  services: Record<string, { features: string[] }>;
};

export type ProjectConfig = MonolithConfig | MicroserviceConfig;
