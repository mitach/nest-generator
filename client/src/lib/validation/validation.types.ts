export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  /** Whether the configuration is valid (no errors) */
  isValid: boolean;
  /** Critical errors that prevent generation */
  errors: ValidationError[];
  /** Non-critical warnings that don't block generation */
  warnings: ValidationError[];
  /** Whether there are any errors or warnings */
  hasIssues: boolean;
}

export interface FeatureDependency {
  /** The feature that has dependencies */
  feature: string;
  /** All of these features are required  */
  requires?: string[];
  /** At least one of these features is required  */
  requiresOneOf?: string[];
  /** Features that conflict with this feature */
  conflicts?: string[];
  /** Readable description of the dependency */
  description: string;
}

export interface ProjectValidationConfig {
  projectName: string;
  architecture: 'monolith' | 'microservice';
  features: string[];
  config?: Record<string, unknown>;
}

export type ValidationRule = (config: ProjectValidationConfig) => ValidationError[];
