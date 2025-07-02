export interface ErrorResponse {
  message: string;
  code: string;
  details?: any;
  timestamp: string;
  path?: string;
}

export interface GenerationErrorDetails {
  featureName?: string;
  architecture?: string;
  templatePath?: string;
  filePath?: string;
  dependency?: string;
  generationId?: string;
}

export class GenerationError extends Error {
  constructor(
    public readonly response: ErrorResponse,
    public readonly httpStatus?: number,
  ) {
    super(response.message);
    this.name = 'GenerationError';
  }

  get code(): string {
    return this.response.code;
  }

  get details(): GenerationErrorDetails | undefined {
    return this.response.details;
  }
}

export function getErrorMessage(error: ErrorResponse): string {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      return `Project configuration is invalid: ${error.message}`;

    case 'TEMPLATE_ERROR': {
      const template = error.details?.templatePath;
      return template
        ? `Template error in ${template}: ${error.message}`
        : `Template processing failed: ${error.message}`;
    }

    case 'FILESYSTEM_ERROR': {
      const filePath = error.details?.filePath;
      return filePath
        ? `File operation failed for ${filePath}: ${error.message}`
        : `File system error: ${error.message}`;
    }

    case 'DEPENDENCY_ERROR': {
      const dependency = error.details?.dependency;
      return dependency
        ? `Dependency issue with ${dependency}: ${error.message}`
        : `Dependency resolution failed: ${error.message}`;
    }

    case 'FEATURE_NOT_FOUND': {
      const { featureName, architecture } = error.details || {};
      return `Feature "${featureName}" is not available for ${architecture} projects`;
    }

    case 'GENERATION_NOT_FOUND':
      return 'Generation session not found. Please try generating again.';

    case 'PROJECT_NOT_READY':
      return 'Project is still being generated. Please wait...';

    case 'PROJECT_DATA_MISSING':
      return 'Generated project data is missing. Please try again.';

    default:
      return error.message || 'An unexpected error occurred';
  }
}

export function getErrorSolution(error: ErrorResponse): string | null {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      return 'Please check your project configuration and try again.';

    case 'FEATURE_NOT_FOUND':
      return 'This feature may not be supported yet. Try selecting different features.';

    case 'TEMPLATE_ERROR':
      return 'There might be an issue with the template. Please try with different configuration.';

    case 'DEPENDENCY_ERROR':
      return 'Please check your internet connection and try again.';

    case 'GENERATION_NOT_FOUND':
      return 'Click "Generate & Download" to start a new generation.';

    case 'PROJECT_NOT_READY':
      return 'The generation is in progress. Please wait a moment.';

    default:
      return null;
  }
}
