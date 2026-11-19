import type { LoggingPort } from '@hexafy/core/application';
import { UseCase, type UseCaseConfiguration } from '@hexafy/core/application';
import { ConflictError, ValidationError } from '@hexafy/core/domain';

import type { Project, ValidProjectCreationProperties } from '../../../domain';
import type { ProjectPort } from '../../ports';

export type CreateProjectUseCaseInput = {
  name: string;
  description: string | null;
  ownerId: string;
};

export type CreateProjectUseCaseOutput = Project;

export class CreateProjectUseCase extends UseCase<
  CreateProjectUseCaseInput,
  CreateProjectUseCaseOutput
> {
  constructor(
    private readonly projectPort: ProjectPort,
    config: UseCaseConfiguration = {}
  ) {
    super(config);
  }

  protected async executeInternal(
    input: CreateProjectUseCaseInput,
    logger: LoggingPort
  ): Promise<CreateProjectUseCaseOutput> {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Project name is required');
    }

    if (input.name.length > 100) {
      throw new ValidationError(
        'Project name must be less than 100 characters'
      );
    }

    const existingProject = await this.projectPort.findByOwnerId(input.ownerId);
    const projectWithName = existingProject.find(
      (p) => p.name.toLowerCase() === input.name.toLowerCase()
    );

    if (projectWithName) {
      throw new ConflictError('A project with this name already exists');
    }

    const project = await this.projectPort.create({
      name: input.name,
      description: input.description ?? null,
      ownerId: input.ownerId
    } as ValidProjectCreationProperties);

    logger.info('Project created', { projectId: project.id });
    return project;
  }
}
