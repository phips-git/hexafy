import { Usecase } from '@hexafy/core/application';
import { NotFoundError } from '@hexafy/core/domain';

import type { Task } from '../../domain/task-management/models/task';
import type { TaskPort } from '../../domain/task-management/ports';

export type CompleteTaskInput = {
  taskId: string;
};

export type CompleteTaskOutput = {
  task: Task;
};

class TaskNotFoundError extends NotFoundError {
  constructor(taskId: string) {
    super(`Task ${taskId} not found`);
    this.name = 'TaskNotFoundError';
  }
}

export class CompleteTaskUseCase extends Usecase<
  CompleteTaskInput,
  CompleteTaskOutput
> {
  constructor(private readonly taskPort: TaskPort) {
    super();
  }

  protected async executeInternal(
    input: CompleteTaskInput,
    logger: LoggingPort
  ): Promise<CompleteTaskOutput> {
    const task = await this.taskPort.findById(input.taskId);

    if (!task) {
      logger.warn('Task not found', { taskId: input.taskId });
      throw new TaskNotFoundError(input.taskId);
    }

    const updatedTask = await this.taskPort.update(task.id, {
      status: 'completed'
    });

    logger.info('Task completed', { taskId: input.taskId });
    return { task: updatedTask };
  }
}
