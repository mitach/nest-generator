import { ValidationResult, ProjectValidationConfig } from './validation.types';
import {
  validateProjectName,
  validateFeatureDependencies,
  validateDatabaseConfiguration,
  validateArchitectureConsistency,
  validateSecurityConfiguration,
} from './validation.rules';

export class ProjectValidationService {
  private static readonly VALIDATION_RULES = [
    validateProjectName,
    validateFeatureDependencies,
    validateDatabaseConfiguration,
    validateArchitectureConsistency,
    validateSecurityConfiguration,
  ];

  static validateConfiguration(config: ProjectValidationConfig): ValidationResult {
    const validationErrors = [];

    for (const rule of this.VALIDATION_RULES) {
      validationErrors.push(...rule(config));
    }

    const errors = validationErrors.filter((e) => e.severity === 'error');
    const warnings = validationErrors.filter((e) => e.severity === 'warning');

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasIssues: validationErrors.length > 0,
    };
  }

  static validateField(
    config: ProjectValidationConfig,
    field: keyof ProjectValidationConfig,
  ): ValidationResult {
    const fieldRules = this.VALIDATION_RULES.filter((rule) => {
      const testConfig = { ...config };
      const testErrors = rule(testConfig);
      return testErrors.some((error) => error.field === field);
    });

    const allErrors = [];
    for (const rule of fieldRules) {
      const ruleErrors = rule(config);
      allErrors.push(...ruleErrors.filter((e) => e.field === field));
    }

    const errors = allErrors.filter((e) => e.severity === 'error');
    const warnings = allErrors.filter((e) => e.severity === 'warning');

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasIssues: allErrors.length > 0,
    };
  }
}
