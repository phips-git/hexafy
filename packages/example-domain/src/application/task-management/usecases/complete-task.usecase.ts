import {
  CancellationToken,
  LoggerPort,
  Usecase,
  UsecaseExecutionDependencies
} from '@hexafy/core/application';

import type { Task } from '../../domain/task-management/models';
import type { TaskPort } from '../../domain/task-management/ports';

interface CompleteTaskInput {
  taskId: string;
}

interface CompleteTaskOutput {
  task: Task;
}

/** Task not found error. */
class TaskNotFoundError extends Error {
  readonly code = 'NOT_FOUND';

  constructor(taskId: string) {
    super(`Task ${taskId} not found`);
    this.name = 'TaskNotFoundError';
  }
}

export class CompleteTaskUseCase extends Usecase<
  CompleteTaskInput,
  CompleteTaskOutput
> {
  constructor(
    private readonly taskPort: TaskPort,
    dependencies: UsecaseExecutionDependencies
  ) {
    super(dependencies);
  }

  protected async executeInternal(
    input: CompleteTaskInput,
    logger: LoggerPort,
    cancellationToken?: CancellationToken
  ): Promise<CompleteTaskOutput> {
    // Handle cancellation
    if (cancellationToken?.isCancelled) {
      logger.warn('Task cancelled', { taskId: input.taskId });
      throw new Error('Request cancelled');
    }

    // Find task
    const task = await this.taskPort.findById(input.taskId);

    // Not found - log and throw
    if (!task) {
      logger.warn('Task not found', { taskId: input.taskId });
      throw new TaskNotFoundError(input.taskId);
    }

    // Update task
    const updatedTask = await this.taskPort.update(task.id, {
      status: 'completed'
    });

    logger.info('Task completed', { taskId: input.taskId });
    return { task: updatedTask };
  }
}
