import type { Result } from '@hexafy/core/result';
import type { UsecaseExecutionDependencies } from '@hexafy/core/usecase';

import type {
  Task,
  TaskCreationProperties
} from '../../domain/task-management/models';
import type { TaskPort } from '../../domain/task-management/ports';

interface CreateTaskUseCaseInput extends TaskCreationProperties {
  projectId: string;
}

export class CreateTaskUseCase {
  constructor(
    private readonly taskPort: TaskPort,
    private readonly dependencies: UsecaseExecutionDependencies
  ) {}

  async execute(input: CreateTaskUseCaseInput): Promise<Result<Task>> {
    // Validate input
    if (!input.title || input.title.trim().length === 0) {
      return { success: false, error: new Error('Title is required') };
    }

    if (input.title.length > 200) {
      return {
        success: false,
        error: new Error('Title must be less than 200 characters')
      };
    }

    // Create task
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

    return { success: true, value: task };
  }
}
