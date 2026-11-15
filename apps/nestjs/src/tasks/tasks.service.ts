import type { UsecaseConfiguration } from '@hexafy/core/application';
import { JSONConsoleLoggingAdapter } from '@hexafy/core/infrastructure';
import { CreateTaskUseCase } from '@hexafy/example-domain/application';
import type { AuthorizationContext } from '@hexafy/example-domain/domain';
import { Injectable } from '@nestjs/common';

import { CreateTaskDto, UpdateTaskDto } from './dtos/create-task.dto';

export interface AuthorizationContextLite {
  readonly tenantId: string;
  readonly projectId: string;
  readonly role: string;
}

type TaskRecord = {
  id: string;
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  assignedTo?: string | null;
  dueDate?: Date | null;
};

class UpdateTaskUseCaseAdapter {
  constructor(
    private readonly taskPort: {
      findById: (id: string) => Promise<TaskRecord | null>;
      update: (
        id: string,
        data: Record<string, unknown>
      ) => Promise<TaskRecord>;
    }
  ) {}

  async execute(input: {
    taskId: string;
    projectId: string;
    updateProperties: Record<string, unknown>;
  }) {
    const task = await this.taskPort.findById(input.taskId);
    if (!task) throw new Error('Task not found');
    return this.taskPort.update(input.taskId, input.updateProperties);
  }
}

class DeleteTaskUseCaseAdapter {
  constructor(
    private readonly taskPort: { delete: (id: string) => Promise<void> }
  ) {}

  async execute(input: { taskId: string; projectId: string }) {
    await this.taskPort.delete(input.taskId);
  }
}

@Injectable()
export class TasksService {
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

  async createTask(
    dto: CreateTaskDto,
    projectId: string,
    authorizationContext: AuthorizationContextLite
  ): Promise<{ taskId: string }> {
    const persistencePorts = this.databaseService.getPersistencePorts();
    const usecase = new CreateTaskUseCase(
      persistencePorts.taskPersistence,
      this.getUsecaseDependencies()
    );

    const output = await usecase.execute({
      projectId,
      title: dto.title,
      description: dto.description ?? null,
      priority: dto.priority ?? 'medium',
      assignedTo: dto.assignedTo ?? null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      authorizationContext: this.mapToExampleDomainContext(authorizationContext)
    });

    if (!output.success) {
      throw output.error;
    }

    return { taskId: String(output.value.id) };
  }

  async updateTask(
    taskId: string,
    projectId: string,
    dto: UpdateTaskDto,
    _authorizationContext: AuthorizationContextLite
  ): Promise<{ taskId: string }> {
    const persistencePorts = this.databaseService.getPersistencePorts();
    const usecase = new UpdateTaskUseCaseAdapter(
      persistencePorts.taskPersistence
    );
    const output = await usecase.execute({
      taskId,
      projectId,
      updateProperties: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        assignedTo: dto.assignedTo,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null
      }
    });
    return { taskId: output.id };
  }

  async deleteTask(
    taskId: string,
    projectId: string,
    _authorizationContext: AuthorizationContextLite
  ): Promise<void> {
    const persistencePorts = this.databaseService.getPersistencePorts();
    const usecase = new DeleteTaskUseCaseAdapter(
      persistencePorts.taskPersistence
    );
    await usecase.execute({ taskId, projectId });
  }

  async getTask(_projectId: string, taskId: string): Promise<unknown> {
    const persistencePorts = this.databaseService.getPersistencePorts();
    return await persistencePorts.taskPersistence.findById(taskId);
  }

  async getTasksForProject(projectId: string): Promise<unknown[]> {
    const persistencePorts = this.databaseService.getPersistencePorts();
    return await persistencePorts.taskPersistence.findByProjectId(projectId);
  }

  private mapToExampleDomainContext(
    context: AuthorizationContextLite
  ): AuthorizationContext {
    return {
      tenantId: context.tenantId,
      userId: context.projectId,
      projectId: context.projectId,
      taskId: undefined
    };
  }
}
