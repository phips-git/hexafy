import { CreateProjectUseCase } from '@hexafy/example-domain/application';
import type { UserId } from '@hexafy/example-domain/domain';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly createProjectUseCase: CreateProjectUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProject(
    @Body()
    input: { name: string; description?: string | null; ownerId: string }
  ): Promise<{
    project: { id: string; name: string; description: string | null };
  }> {
    const result = await this.createProjectUseCase.execute({
      name: input.name,
      description: input.description ?? null,
      ownerId: input.ownerId as UserId
    });

    if (!result.success) {
      throw result.error;
    }

    return {
      project: {
        id: result.value.id,
        name: result.value.name,
        description: result.value.description
      }
    };
  }
}
