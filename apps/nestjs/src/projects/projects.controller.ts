import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { CreateProjectUseCase } from '../domain/use-cases/create-project.use-case';
import { CreateProjectDto, ProjectResponse } from './dtos/project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly createProjectUseCase: CreateProjectUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProject(
    @Body() input: CreateProjectDto
  ): Promise<ProjectResponse> {
    const result = await this.createProjectUseCase.execute({
      name: input.name,
      description: input.description ?? null
    });

    if (!result.success) {
      throw result.error;
    }

    return {
      id: result.value.id,
      name: result.value.name,
      description: result.value.description,
      createdAt: new Date().toISOString()
    };
  }
}
