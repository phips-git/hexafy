import type { UsecaseResult } from '@hexafy/core/application';
import { InMemoryProjectRepository } from '@hexafy/example-domain/infrastructure';
import { Injectable } from '@nestjs/common';

export interface CreateProjectInput {
  name: string;
  description?: string | null;
}

export interface ProjectCreated {
  id: string;
  name: string;
  description: string | null;
}

@Injectable()
export class CreateProjectUseCase {
  private readonly projectRepository = new InMemoryProjectRepository();

  async execute(
    input: CreateProjectInput
  ): Promise<UsecaseResult<ProjectCreated>> {
    try {
      const project = await this.projectRepository.create({
        name: input.name,
        description: input.description ?? null,
        ownerId: 'demo-user'
      });

      return {
        success: true,
        value: {
          id: project.id,
          name: project.name,
          description: project.description
        }
      };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
}
