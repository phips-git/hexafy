import type { LoggingPort } from '@hexafy/core/application';
import { UseCase, type UseCaseConfiguration } from '@hexafy/core/application';
import type { Brand } from '@hexafy/core/domain';

import type {
  Task,
  TaskCreationProperties
} from '../../../domain/task-management/models/task';
import type { TaskPort } from '../../ports';

export type CreateTaskUseCaseInput = Omit<
  TaskCreationProperties,
  'projectId' | 'assignedTo'
> & {
  projectId: Brand<string, 'ProjectId'>;
  assignedTo: Brand<string, 'UserId'> | null;
};

export type CompleteTaskUseCaseInput = {
  taskId: Brand<string, 'TaskId'>;
};

export class CreateTaskUseCase extends UseCase<CreateTaskUseCaseInput, Task> {
  constructor(
    private readonly taskPort: TaskPort,
    config: UseCaseConfiguration = {}
  ) {
    super(config);
  }

  protected async executeInternal(
    input: CreateTaskUseCaseInput,
    logger: LoggingPort
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
      priority: input.priority,
      assignedTo: input.assignedTo,
      dueDate: input.dueDate,
      projectId: input.projectId
    });

    logger.info('Task created', { taskId: task.id });
    return task;
  }
}
