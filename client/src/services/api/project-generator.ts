import { ErrorResponse, GenerationError } from '@/lib/errors';

export interface ProjectConfig {
  [key: string]: unknown;
}

export interface GenerationResponse {
  generationId: string;
}

export interface StatusResponse {
  status: 'pending' | 'completed' | 'failed';
  downloadUrl?: string;
  error?: ErrorResponse;
}

export class ProjectGeneratorAPI {
  constructor(private readonly baseUrl: string) {}

  async generateProject(config: ProjectConfig): Promise<GenerationResponse> {
    // console.warn('generate project with config ->', config);

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof GenerationError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new GenerationError({
        message: 'Failed to start project generation',
        code: 'NETWORK_ERROR',
        timestamp: new Date().toISOString(),
        details: { originalError: errorMessage },
      });
    }
  }

  async checkStatus(generationId: string): Promise<StatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate/${generationId}/status`);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof GenerationError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new GenerationError({
        message: 'Failed to check generation status',
        code: 'NETWORK_ERROR',
        timestamp: new Date().toISOString(),
        details: { generationId, originalError: errorMessage },
      });
    }
  }

  async downloadProject(downloadUrl: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}${downloadUrl}`);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return await response.blob();
    } catch (error) {
      if (error instanceof GenerationError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new GenerationError({
        message: 'Failed to download project',
        code: 'DOWNLOAD_ERROR',
        timestamp: new Date().toISOString(),
        details: { downloadUrl, originalError: errorMessage },
      });
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: ErrorResponse;

    try {
      errorData = await response.json();
    } catch {
      // Fallback if response is not JSON
      errorData = {
        message: response.statusText || 'Unknown error occurred',
        code: 'HTTP_ERROR',
        timestamp: new Date().toISOString(),
        details: { status: response.status, statusText: response.statusText },
      };
    }

    throw new GenerationError(errorData, response.status);
  }
}
