import { ProjectConfig } from "@/types/project";

export class ProjectGeneratorAPI {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
  }

  async generateProject(config: ProjectConfig): Promise<{ generationId: string }> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error('Failed to start generation');
    }

    return response.json();
  }

  async checkStatus(generationId: string): Promise<{
    status: string;
    downloadUrl?: string;
    error?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/generate/${generationId}/status`);
    
    if (!response.ok) {
      throw new Error('Failed to check status');
    }

    return response.json();
  }

  async downloadProject(downloadUrl: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}${downloadUrl}`);
    return response.blob();
  }
}