export interface Service {
  id: string;
  name: string;
  type: string;
  features: string[];
  config?: ServiceConfig | undefined;
  color?: string;
  locked?: boolean;
}

export interface ServiceConfig {
  authFields?: string[];
  profileFields?: string[];
  features?: {
    emailVerification?: boolean;
    passwordReset?: boolean;
    twoFactorAuth?: boolean;
    accountLocking?: boolean;
    sessionManagement?: boolean;
    activityLogging?: boolean;
    profilePrivacy?: boolean;
    dataExport?: boolean;
    accountDeletion?: boolean;
    socialLogin?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface ServiceTemplate {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  description: string;
  color?: string;
}

export interface ProjectConfig {
  projectName: string;
  architecture: 'monolith' | 'microservice';
  features?: string[];
  services?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

export interface FeatureCategory {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  items: FeatureInfo[];
}

export interface FeatureInfo {
  name: string;
  description: string;
  useCase: string;
  icon?: React.ComponentType<{ className?: string }>;
}
