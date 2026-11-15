import type { UsecaseConfiguration } from '@hexafy/core/application';
import { JSONConsoleLoggingAdapter } from '@hexafy/core/infrastructure';
import { Injectable } from '@nestjs/common';

import { CreateProjectDto, UpdateProjectDto } from './dtos/create-project.dto';

export interface AuthorizationContext {
  readonly tenantId: string;
  readonly projectId: string | null;
  readonly role: string;
}

type ProjectRecord = {
  id: string;
  name?: string;
  description?: string | null;
  ownerId?: string;
};

class CreateProjectUseCaseAdapter {
  constructor(
    private readonly projectPort: {
      create: (data: {
        name: string;
        description: string | null;
        ownerId: string;
      }) => Promise<ProjectRecord>;
    }
  ) {}

  async execute(input: { creationProperties: Record<string, unknown> }) {
    const project = await this.projectPort.create({
      name: String(input.creationProperties.name ?? ''),
      description:
        typeof input.creationProperties.description === 'string'
          ? input.creationProperties.description
          : null,
      ownerId: 'demo-user'
    });
    return { projectId: project.id };
  }
}

class UpdateProjectUseCaseAdapter {
  constructor(
    private readonly projectPort: {
      findById: (id: string) => Promise<ProjectRecord | null>;
      update: (
        id: string,
        data: Record<string, unknown>
      ) => Promise<ProjectRecord>;
    }
  ) {}

  async execute(input: {
    projectId: string;
    updateProperties: Record<string, unknown>;
  }) {
    const project = await this.projectPort.findById(input.projectId);
    if (!project) throw new Error('Project not found');
    const updated = await this.projectPort.update(
      input.projectId,
      input.updateProperties
    );
    return { projectId: updated.id };
  }
}

class DeleteProjectUseCaseAdapter {
  constructor(
    private readonly projectPort: { delete: (id: string) => Promise<void> }
  ) {}

  async execute(input: { projectId: string }) {
    await this.projectPort.delete(input.projectId);
  }
}

@Injectable()
export class ProjectsService {
  constructor(
    private readonly databaseService: import('../infrastructure/database.service').DatabaseService
  ) {}

  private getUsecaseDependencies(): UsecaseConfiguration {
    return {
      generateId: () =>
        this.databaseService.getPersistencePorts().generator.generate(),
      loggerFactory: (name: string) => JSONConsoleLoggingAdapter(name)
    };
  }

  async createProject(
    dto: CreateProjectDto,
    _authorizationContext: AuthorizationContext
  ): Promise<{ projectId: string }> {
    const persistencePorts = this.databaseService.getPersistencePorts();
    const usecase = new CreateProjectUseCaseAdapter(
      persistencePorts.projectPersistence as {
        create: (data: {
          name: string;
          description: string | null;
          ownerId: string;
        }) => Promise<ProjectRecord>;
      }
    );
    const result = await usecase.execute({
      creationProperties: {
        name: dto.name,
        description: dto.description ?? null,
        ownerId: _authorizationContext.tenantId
      }
    });
    return { projectId: result.projectId };
  }

  async updateProject(
    id: string,
    dto: UpdateProjectDto,
    _authorizationContext: AuthorizationContext
  ): Promise<{ projectId: string }> {
    const persistencePorts = this.databaseService.getPersistencePorts();
    const usecase = new UpdateProjectUseCaseAdapter(
      persistencePorts.projectPersistence as {
        findById: (id: string) => Promise<ProjectRecord | null>;
        update: (
          id: string,
          data: Record<string, unknown>
        ) => Promise<ProjectRecord>;
      }
    );
    const result = await usecase.execute({
      projectId: id,
      updateProperties: {
        name: dto.name,
        description: dto.description
      }
    });
    return { projectId: result.projectId };
  }

  async deleteProject(
    id: string,
    _authorizationContext: AuthorizationContext
  ): Promise<void> {
    const persistencePorts = this.databaseService.getPersistencePorts();
    const usecase = new DeleteProjectUseCaseAdapter(
      persistencePorts.projectPersistence as {
        delete: (id: string) => Promise<void>;
      }
    );
    await usecase.execute({ projectId: id });
  }
}
