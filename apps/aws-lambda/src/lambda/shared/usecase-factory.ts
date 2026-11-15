import { JSONConsoleLoggingAdapter } from '@hexafy/core/infrastructure';
import { CreateTaskUseCase } from '@hexafy/example-domain/application';
import {
  InMemoryProjectRepository,
  InMemoryTaskRepository,
  InMemoryUserRepository
} from '@hexafy/example-domain/infrastructure';

const taskRepository = new InMemoryTaskRepository();
const projectRepository = new InMemoryProjectRepository();
const userRepository = new InMemoryUserRepository();

const defaultDependencies = {
  generateId: () => `demo_${Date.now()}_${Math.random().toString(16).slice(2)}`,
  loggerFactory: () => JSONConsoleLoggingAdapter('example-domain-demo')
};

type ProjectCreationInput = {
  name: string;
  description: string | null;
  ownerId?: string;
};

type TaskCreationInput = {
  title: string;
  description: string | null;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string | null;
  dueDate?: Date | null;
};

class UpdateTaskUseCaseAdapter {
  constructor(private readonly taskRepository: InMemoryTaskRepository) {}

  async execute(input: {
    taskId: string;
    projectId: string;
    updateProperties: Record<string, unknown>;
  }) {
    const task = await this.taskRepository.findById(input.taskId);
    if (!task) throw new Error('Task not found');
    const updated = await this.taskRepository.update(
      input.taskId,
      input.updateProperties as Record<string, unknown>
    );
    return { taskId: updated.id };
  }
}

class DeleteTaskUseCaseAdapter {
  constructor(private readonly taskRepository: InMemoryTaskRepository) {}

  async execute(input: { taskId: string; projectId: string }) {
    await this.taskRepository.delete(input.taskId);
  }
}

class CreateProjectUseCaseAdapter {
  constructor(private readonly projectRepository: InMemoryProjectRepository) {}

  async execute(input: { creationProperties: ProjectCreationInput }) {
    const project = await this.projectRepository.create({
      ...input.creationProperties,
      ownerId: input.creationProperties.ownerId ?? 'demo-user'
    });
    return { projectId: project.id };
  }
}

class UpdateProjectUseCaseAdapter {
  constructor(private readonly projectRepository: InMemoryProjectRepository) {}

  async execute(input: {
    projectId: string;
    updateProperties: Record<string, unknown>;
  }) {
    const project = await this.projectRepository.findById(input.projectId);
    if (!project) throw new Error('Project not found');
    const updated = await this.projectRepository.update(
      input.projectId,
      input.updateProperties as Record<string, unknown>
    );
    return { projectId: updated.id };
  }
}

class DeleteProjectUseCaseAdapter {
  constructor(private readonly projectRepository: InMemoryProjectRepository) {}

  async execute(input: { projectId: string }) {
    await this.projectRepository.delete(input.projectId);
  }
}

export function getCreateTaskUsecase() {
  return {
    async execute(input: {
      projectId: string;
      creationProperties: TaskCreationInput;
    }) {
      const usecase = new CreateTaskUseCase(
        taskRepository,
        defaultDependencies
      );
      const result = await usecase.execute({
        projectId: input.projectId,
        title: input.creationProperties.title ?? '',
        description: input.creationProperties.description ?? null,
        priority: input.creationProperties.priority ?? 'medium',
        assignedTo: input.creationProperties.assignedTo ?? null,
        dueDate: input.creationProperties.dueDate ?? null
      });
      if (!result.success) {
        throw result.error;
      }
      return { taskId: result.value.id };
    }
  };
}

export function getUpdateTaskUsecase() {
  return new UpdateTaskUseCaseAdapter(taskRepository);
}

export function getDeleteTaskUsecase() {
  return new DeleteTaskUseCaseAdapter(taskRepository);
}

export function getListTasksUsecase() {
  return {
    async execute(input: { projectId: string }) {
      return taskRepository.findByProjectId(input.projectId);
    }
  };
}

export function getCreateProjectUsecase() {
  return new CreateProjectUseCaseAdapter(projectRepository);
}

export function getUpdateProjectUsecase() {
  return new UpdateProjectUseCaseAdapter(projectRepository);
}

export function getDeleteProjectUsecase() {
  return new DeleteProjectUseCaseAdapter(projectRepository);
}

export function getGetAuthenticatedUserUsecase() {
  return {
    async execute(input: { headers?: Record<string, string | undefined> }) {
      const header =
        input.headers?.authorization ?? input.headers?.Authorization;
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
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );
    }
  };
}
