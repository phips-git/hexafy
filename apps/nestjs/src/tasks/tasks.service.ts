import { Injectable } from '@nestjs/common';

import { CompleteTaskUseCase } from '../domain/use-cases/complete-task.use-case';
import { CreateTaskUseCase } from '../domain/use-cases/create-task.use-case';
import { ListTasksUseCase } from '../domain/use-cases/list-tasks.use-case';

@Injectable()
export class TasksService {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly completeTaskUseCase: CompleteTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase
  ) {}

  async createTask(
    title: string,
    description: string | null,
    projectId: string,
    priority?: 'low' | 'medium' | 'high',
    assignedTo?: string | null,
    dueDate?: Date | null
  ) {
    const result = await this.createTaskUseCase.execute({
      title,
      description,
      projectId,
      priority,
      assignedTo,
      dueDate
    });

    if (!result.success) {
      throw result.error;
    }

    return result.value;
  }

  async completeTask(taskId: string) {
    const result = await this.completeTaskUseCase.execute({ taskId });

    if (!result.success) {
      throw result.error;
    }

    return result.value;
  }

  async listTasks(projectId: string) {
    const result = await this.listTasksUseCase.execute({ projectId });

    if (!result.success) {
      throw result.error;
    }

    return result.value;
  }
}
