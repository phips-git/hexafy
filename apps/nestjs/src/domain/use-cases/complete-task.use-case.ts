import type { UsecaseResult } from '@hexafy/core/application';
import { CompleteTaskUseCase } from '@hexafy/example-domain/application';
import { InMemoryTaskRepository } from '@hexafy/example-domain/infrastructure';
import { Injectable } from '@nestjs/common';

export interface CompleteTaskInput {
  taskId: string;
}

export interface TaskCompleted {
  id: string;
  status: string;
}

@Injectable()
export class CompleteTaskUseCase {
  private readonly delegate: CompleteTaskUseCase;

  constructor() {
    const taskRepository = new InMemoryTaskRepository();
    this.delegate = new CompleteTaskUseCase(taskRepository);
  }

  async execute(
    input: CompleteTaskInput
  ): Promise<UsecaseResult<TaskCompleted>> {
    const result = await this.delegate.execute({
      taskId: input.taskId
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      value: {
        id: result.value.task.id,
        status: result.value.task.status
      }
    };
  }
}
