import { Controller, Post, Get, Param, Body, Res, HttpStatus, HttpException } from '@nestjs/common';
import { GeneratorService } from '../services/generator.service';
import { GenerateProjectDto } from '../dto/generate-project.dto';
import { Response } from 'express';
import { GenerationError } from '../../common/errors/generation.errors';
import { createErrorResponse } from '../../common/errors';

@Controller('api/generate')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  @Post()
  generateProject(@Body() generateProjectDto: GenerateProjectDto) {
    try {
      const generationId = this.generatorService.startGeneration(generateProjectDto);
      return {
        generationId,
        status: 'pending',
      };
    } catch (error) {
      if (error instanceof GenerationError) {
        throw new HttpException(createErrorResponse(error), HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        createErrorResponse(error as Error),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/status')
  getGenerationStatus(@Param('id') id: string) {
    try {
      const status = this.generatorService.getGenerationStatus(id);
      return {
        status: status.status,
        downloadUrl: status.status === 'completed' ? `/api/generate/${id}/download` : null,
        error: status.error,
      };
    } catch (error) {
      if (error instanceof GenerationError) {
        throw new HttpException(createErrorResponse(error), HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        createErrorResponse(error as Error),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/download')
  downloadProject(@Param('id') id: string, @Res() res: Response) {
    try {
      const zipBuffer = this.generatorService.getGeneratedProject(id);

      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=project.zip`,
      });

      res.status(HttpStatus.OK).send(zipBuffer);
    } catch (error) {
      if (error instanceof GenerationError) {
        const errorResponse = createErrorResponse(error);
        res.status(HttpStatus.BAD_REQUEST).json(errorResponse);
      } else {
        const errorResponse = createErrorResponse(error as Error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
      }
    }
  }
}
