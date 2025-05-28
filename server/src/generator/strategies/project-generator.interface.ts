export interface ProjectGeneratorStrategy {
  generateProject(data: any): Promise<Buffer>;
}
