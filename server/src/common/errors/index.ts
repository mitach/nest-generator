import { GenerationError } from './generation.errors';

export interface ErrorResponse {
  message: string;
  code: string;
  details?: any;
  timestamp: string;
  path?: string;
}

export function createErrorResponse(error: Error, path?: string): ErrorResponse {
  if (error instanceof GenerationError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    details: undefined,
    timestamp: new Date().toISOString(),
    path,
  };
}
