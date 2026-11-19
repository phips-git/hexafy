import type { UseCaseConfiguration } from '@hexafy/core/application';
import {
  JSONConsoleLoggingAdapter,
  NoOpMetricsAdapter,
  SystemClockAdapter,
  SystemIdentifierAdapter
} from '@hexafy/core/infrastructure';
import {
  CreateProjectUseCase,
  CreateTaskUseCase,
  type CreateTaskUseCaseInput
} from '@hexafy/example-domain/application';
import type { ProjectId, UserId } from '@hexafy/example-domain/domain';
import {
  InMemoryProjectRepository,
  InMemoryTaskRepository,
  InMemoryUserRepository
} from '@hexafy/example-domain/infrastructure';

const userRepository = new InMemoryUserRepository();
const DEFAULT_OWNER_ID = 'demo-user' as UserId;

const DEFAULT_CONFIG: UseCaseConfiguration = {
  logger: JSONConsoleLoggingAdapter('aws-lambda'),
  clock: SystemClockAdapter,
  identifier: SystemIdentifierAdapter,
  metrics: NoOpMetricsAdapter
};

export function getCreateProjectUseCase() {
  const projectRepository = new InMemoryProjectRepository();

  return {
    async execute(input: {
      creationProperties: {
        name: string;
        description: string | null;
        ownerId?: string;
      };
    }) {
      const useCase = new CreateProjectUseCase(
        projectRepository,
        DEFAULT_CONFIG
      );
      const ownerId = input.creationProperties.ownerId ?? DEFAULT_OWNER_ID;

      const result = await useCase.execute({
        name: input.creationProperties.name,
        description: input.creationProperties.description,
        ownerId: ownerId as UserId
      });

      if (!result.success) {
        throw result.error;
      }

      return { projectId: result.value.id };
    }
  };
}

export function getCreateTaskUseCase() {
  const taskRepository = new InMemoryTaskRepository();

  return {
    async execute(input: {
      projectId: string;
      creationProperties: {
        title: string;
        description?: string | null;
        priority?: 'low' | 'medium' | 'high';
        assignedTo?: string | null;
        dueDate?: Date | null;
      };
    }) {
      const useCase = new CreateTaskUseCase(taskRepository, DEFAULT_CONFIG);

      const createInput: CreateTaskUseCaseInput = {
        projectId: input.projectId as ProjectId,
        title: input.creationProperties.title,
        description: input.creationProperties.description ?? null,
        priority: input.creationProperties.priority ?? 'medium',
        assignedTo: (input.creationProperties.assignedTo ?? null) as UserId,
        dueDate: input.creationProperties.dueDate ?? null
      };

      const result = await useCase.execute(createInput);
      if (!result.success) {
        throw result.error;
      }
      return { taskId: result.value.id };
    }
  };
}

export function getUpdateTaskUseCase() {
  return {
    async execute(input: {
      taskId: string;
      updateProperties: Record<string, unknown>;
    }) {
      const taskRepository = new InMemoryTaskRepository();
      const task = await taskRepository.findById(input.taskId);
      if (!task) throw new Error('Task not found');
      const updated = await taskRepository.update(
        input.taskId,
        input.updateProperties
      );
      return { taskId: updated.id };
    }
  };
}

export function getDeleteTaskUseCase() {
  return {
    async execute(input: { taskId: string }) {
      const taskRepository = new InMemoryTaskRepository();
      await taskRepository.delete(input.taskId);
    }
  };
}

export function getListTasksUseCase() {
  return {
    async execute(input: { projectId: string }) {
      const taskRepository = new InMemoryTaskRepository();
      return taskRepository.findByProjectId(input.projectId);
    }
  };
}

export function getDeleteProjectUseCase() {
  return {
    async execute(input: { projectId: string }) {
      const projectRepository = new InMemoryProjectRepository();
      await projectRepository.delete(input.projectId);
    }
  };
}

export function getUpdateProjectUseCase() {
  return {
    async execute(input: {
      projectId: string;
      updateProperties: Record<string, unknown>;
    }) {
      const projectRepository = new InMemoryProjectRepository();
      const project = await projectRepository.findById(input.projectId);
      if (!project) throw new Error('Project not found');
      const updated = await projectRepository.update(
        input.projectId,
        input.updateProperties
      );
      return { projectId: updated.id };
    }
  };
}

export function getGetAuthenticatedUserUseCase() {
  return {
    async execute(input: { headers?: Record<string, string | undefined> }) {
      const header =
        input.headers?.['authorization'] ?? input.headers?.['Authorization'];
      const token = header?.startsWith('Bearer ') ? header.slice(7) : header;
      if (!token) {
        return null;
      }

      const user = await userRepository.findByEmail('demo@example.com');
      return (
        user ?? {
          id: 'demo-user',
          tenantId: 'demo-tenant',
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'user' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );
    }
  };
}
