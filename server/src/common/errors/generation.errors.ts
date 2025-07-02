export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}

export class ValidationError extends GenerationError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class TemplateError extends GenerationError {
  constructor(message: string, templatePath?: string, details?: any) {
    super(message, 'TEMPLATE_ERROR', { templatePath, ...details });
    this.name = 'TemplateError';
  }
}

export class FileSystemError extends GenerationError {
  constructor(message: string, filePath?: string, details?: any) {
    super(message, 'FILESYSTEM_ERROR', { filePath, ...details });
    this.name = 'FileSystemError';
  }
}

export class DependencyError extends GenerationError {
  constructor(message: string, dependency?: string, details?: any) {
    super(message, 'DEPENDENCY_ERROR', { dependency, ...details });
    this.name = 'DependencyError';
  }
}

export class FeatureNotFoundError extends GenerationError {
  constructor(featureName: string, architecture: string) {
    super(
      `Feature "${featureName}" not found for ${architecture} architecture`,
      'FEATURE_NOT_FOUND',
      { featureName, architecture },
    );
    this.name = 'FeatureNotFoundError';
  }
}
