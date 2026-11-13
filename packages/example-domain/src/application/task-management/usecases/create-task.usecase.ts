import type {
  UsecaseConfiguration,
  UsecaseResult
} from '@hexafy/core/application';

import type {
  Task,
  TaskCreationProperties
} from '../../domain/task-management/models/task';
import type { TaskPort } from '../../domain/task-management/ports';

interface CreateTaskUseCaseInput extends TaskCreationProperties {
  projectId: string;
}

export class CreateTaskUseCase {
  constructor(
    private readonly taskPort: TaskPort,
    private readonly dependencies: UsecaseConfiguration
  ) {}

  async execute(input: CreateTaskUseCaseInput): Promise<UsecaseResult<Task>> {
    if (!input.title || input.title.trim().length === 0) {
      return { success: false, error: new Error('Title is required') };
    }

    if (input.title.length > 200) {
      return {
        success: false,
        error: new Error('Title must be less than 200 characters')
      };
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

    return { success: true, value: task };
  }
}
