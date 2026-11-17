import type { UsecaseResult } from '@hexafy/core/application';
import { InMemoryTaskRepository } from '@hexafy/example-domain/infrastructure';
import { Injectable } from '@nestjs/common';

export interface ListTasksInput {
  projectId: string;
}

export interface TaskListItem {
  id: string;
  title: string;
  status: string;
  priority: string;
}

@Injectable()
export class ListTasksUseCase {
  private readonly taskRepository = new InMemoryTaskRepository();

  async execute(input: ListTasksInput): Promise<UsecaseResult<TaskListItem[]>> {
    const tasks = await this.taskRepository.findByProjectId(input.projectId);

    return {
      success: true,
      value: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority
      }))
    };
  }
}
