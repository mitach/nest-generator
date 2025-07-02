import { ValidationRule, FeatureDependency } from './validation.types';

const FEATURE_DEPENDENCIES: FeatureDependency[] = [
  {
    feature: 'auth:jwt',
    requiresOneOf: ['users:mongodb', 'users:postgres'],
    description: 'JWT authentication requires user management functionality',
  },
  {
    feature: 'auth:google',
    requiresOneOf: ['auth:jwt'],
    description: 'Google OAuth requires JWT authentication as base',
  },
  {
    feature: 'roles:mongodb',
    requiresOneOf: ['users:mongodb'],
    description: 'Role management requires MongoDB user system',
  },
  {
    feature: 'roles:postgres',
    requiresOneOf: ['users:postgres'],
    description: 'Role management requires PostgreSQL user system',
  },
  {
    feature: 'permissions:mongodb',
    requires: ['users:mongodb', 'roles:mongodb'],
    description: 'Permission system requires users and roles',
  },
  {
    feature: 'permissions:postgres',
    requires: ['users:postgres', 'roles:postgres'],
    description: 'Permission system requires users and roles',
  },
];

const DATABASE_FEATURES = [
  'database:mongodb',
  'database:postgres',
  'database:mysql',
  'users:mongodb',
  'users:postgres',
];

export const validateProjectName: ValidationRule = (config) => {
  const errors = [];
  const name = config.projectName?.trim();

  if (!name) {
    errors.push({
      field: 'projectName',
      message: 'Project name is required',
      severity: 'error' as const,
    });
    return errors;
  }

  if (name.length < 3) {
    errors.push({
      field: 'projectName',
      message: 'Project name must be at least 3 characters long',
      severity: 'error' as const,
    });
  }

  if (name.length > 50) {
    errors.push({
      field: 'projectName',
      message: 'Project name must be less than 50 characters',
      severity: 'error' as const,
    });
  }

  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name) && name.length > 1) {
    errors.push({
      field: 'projectName',
      message:
        'Project name must contain only lowercase letters, numbers, and hyphens (no consecutive hyphens)',
      severity: 'error' as const,
    });
  }

  if (/^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(name)) {
    errors.push({
      field: 'projectName',
      message: 'Project name cannot be a reserved Windows filename',
      severity: 'error' as const,
    });
  }

  return errors;
};

export const validateFeatureDependencies: ValidationRule = (config) => {
  const errors = [];
  const features = new Set(config.features);

  for (const { feature, requiresOneOf, requires, conflicts, description } of FEATURE_DEPENDENCIES) {
    if (!features.has(feature)) {
      continue;
    }

    if (requiresOneOf) {
      const hasAnyRequired = requiresOneOf.some((required) => features.has(required));

      if (!hasAnyRequired) {
        const requiredList = requiresOneOf.join('" or "');
        errors.push({
          field: 'features',
          message: `Feature "${feature}" requires one of: "${requiredList}". ${description}`,
          severity: 'error' as const,
        });
      }
    }

    if (requires) {
      const missingDependencies = requires.filter((required) => !features.has(required));

      if (missingDependencies.length > 0) {
        const requiredList = requires.join('", "');
        errors.push({
          field: 'features',
          message: `Feature "${feature}" requires all of: "${requiredList}". ${description}`,
          severity: 'error' as const,
        });
      }
    }

    if (conflicts) {
      for (const conflict of conflicts) {
        if (features.has(conflict)) {
          errors.push({
            field: 'features',
            message: `Feature "${feature}" conflicts with "${conflict}"`,
            severity: 'error' as const,
          });
        }
      }
    }
  }

  return errors;
};

export const validateDatabaseConfiguration: ValidationRule = (config) => {
  const errors = [];
  const databaseFeatures = config.features.filter((f) => DATABASE_FEATURES.includes(f));
  const databaseTypes = new Set(databaseFeatures.map((f) => f.split(':')[1]).filter(Boolean));

  if (databaseTypes.size > 1) {
    errors.push({
      field: 'features',
      message:
        'Multiple database types detected. Consider using only one database type per project',
      severity: 'warning' as const,
    });
  }

  const userFeatures = config.features.filter((f) => f.startsWith('users:'));
  const roleFeatures = config.features.filter((f) => f.startsWith('roles:'));

  if (userFeatures.length > 1) {
    errors.push({
      field: 'features',
      message: 'Multiple user management systems selected. Choose one database type for users',
      severity: 'error' as const,
    });
  }

  if (roleFeatures.length > 1) {
    errors.push({
      field: 'features',
      message: 'Multiple role management systems selected. Choose one database type for roles',
      severity: 'error' as const,
    });
  }

  return errors;
};

export const validateArchitectureConsistency: ValidationRule = (config) => {
  const errors = [];

  if (config.architecture === 'microservice' && config.features.length === 0) {
    errors.push({
      field: 'architecture',
      message: 'Microservice architecture typically requires at least one feature to be meaningful',
      severity: 'warning' as const,
    });
  } else if (config.architecture === 'monolith' && config.features.length > 15) {
    errors.push({
      field: 'architecture',
      message: 'Consider microservice architecture for projects with many features',
      severity: 'warning' as const,
    });
  }

  return errors;
};

export const validateSecurityConfiguration: ValidationRule = (config) => {
  const errors = [];
  const hasAuth = config.features.some((f) => f.startsWith('auth:'));
  const hasUsers = config.features.some((f) => f.startsWith('users:'));
  const hasCors = config.features.includes('cors');
  const hasHelmet = config.features.includes('helmet');

  if (hasAuth || hasUsers) {
    if (!hasCors) {
      errors.push({
        field: 'features',
        message: 'Authentication features require CORS configuration for web applications',
        severity: 'warning' as const,
      });
    }

    if (!hasHelmet) {
      errors.push({
        field: 'features',
        message: 'Authentication features should include Helmet.js for security headers',
        severity: 'warning' as const,
      });
    }
  }

  return errors;
};
