import { Controller, Post, Get, Param, Body, Res, HttpStatus } from '@nestjs/common';
import { GeneratorService } from '../services/generator.service';
import { GenerateProjectDto } from '../dto/generate-project.dto';
import { Response } from 'express';

@Controller('api/generate')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  @Post()
  async generateProject(@Body() generateProjectDto: GenerateProjectDto) {
    const generationId = await this.generatorService.startGeneration(generateProjectDto);
    console.log('generationId', generationId)
    return {
      generationId,
      status: 'pending'
    };
  }

  @Get(':id/status')
  async getGenerationStatus(@Param('id') id: string) {
    const status = await this.generatorService.getGenerationStatus(id);
    return {
      status: status.status,
      downloadUrl: status.status === 'completed' ? `/api/generate/${id}/download` : null,
      error: status.error
    };
  }

  @Get(':id/download')
  async downloadProject(@Param('id') id: string, @Res() res: Response) {
    const zipBuffer = await this.generatorService.getGeneratedProject(id);
    
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename=project.zip`,
    });
    
    res.status(HttpStatus.OK).send(zipBuffer);
  }
} 