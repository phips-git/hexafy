import { Usecase, type UsecaseConfiguration } from '@hexafy/core/application';

import type { Task } from '../../domain/task-management/models/task';
import type { TaskPort } from '../../domain/task-management/ports';

export type CreateTaskUseCaseInput = {
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string | null;
  dueDate: Date | null;
  projectId: string;
};

export class CreateTaskUseCase extends Usecase<CreateTaskUseCaseInput, Task> {
  constructor(
    private readonly taskPort: TaskPort,
    config: UsecaseConfiguration = {}
  ) {
    super(config);
  }

  protected async executeInternal(
    input: CreateTaskUseCaseInput,
    logger: LoggerPort
  ): Promise<Task> {
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Title is required');
    }

    if (input.title.length > 200) {
      throw new Error('Title must be less than 200 characters');
    }

    const task = await this.taskPort.create({
      title: input.title,
      description: input.description,
      priority: input.priority ?? 'medium',
      projectId: input.projectId,
      status: 'pending',
      assignedTo: input.assignedTo,
      dueDate: input.dueDate,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    logger.info('Task created', { taskId: task.id });
    return task;
  }
}
