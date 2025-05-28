import { ProjectConfig } from "@/types/project";

export class ProjectGeneratorAPI {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    // Debug logging (remove this after testing)
    console.log(
      "Environment variable NEXT_PUBLIC_API_URL:",
      process.env.NEXT_PUBLIC_API_URL
    );
    console.log("Passed baseUrl:", baseUrl);

    // Use environment variable if available, otherwise fallback to localhost
    this.baseUrl =
      baseUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      console.log('Final baseUrl:', this.baseUrl);
  }

  async generateProject(
    config: ProjectConfig
  ): Promise<{ generationId: string }> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error("Failed to start generation");
    }

    return response.json();
  }

  async checkStatus(generationId: string): Promise<{
    status: string;
    downloadUrl?: string;
    error?: string;
  }> {
    const response = await fetch(
      `${this.baseUrl}/api/generate/${generationId}/status`
    );

    if (!response.ok) {
      throw new Error("Failed to check status");
    }

    return response.json();
  }

  async downloadProject(downloadUrl: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}${downloadUrl}`);
    return response.blob();
  }
}
