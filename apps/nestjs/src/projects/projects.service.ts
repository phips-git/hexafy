import { Injectable } from '@nestjs/common';

import { CreateProjectUseCase } from '../domain/use-cases/create-project.use-case';

@Injectable()
export class ProjectsService {
  constructor(private readonly createProjectUseCase: CreateProjectUseCase) {}

  async createProject(name: string, description?: string | null) {
    const result = await this.createProjectUseCase.execute({
      name,
      description: description ?? null
    });

    if (!result.success) {
      throw result.error;
    }

    return result.value;
  }
}
