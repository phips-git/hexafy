import type { UsecaseResult } from '@hexafy/core/application';
import { CreateTaskUseCase } from '@hexafy/example-domain/application';
import { InMemoryTaskRepository } from '@hexafy/example-domain/infrastructure';
import { Injectable } from '@nestjs/common';

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  projectId: string;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string | null;
  dueDate?: Date | null;
}

export interface TaskCreated {
  id: string;
  title: string;
  status: string;
  priority: string;
}

@Injectable()
export class CreateTaskUseCase {
  private readonly delegate: CreateTaskUseCase;

  constructor() {
    const taskRepository = new InMemoryTaskRepository();
    this.delegate = new CreateTaskUseCase(taskRepository, {
      logger: console
    });
  }

  async execute(input: CreateTaskInput): Promise<UsecaseResult<TaskCreated>> {
    const result = await this.delegate.execute({
      projectId: input.projectId,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? 'medium',
      assignedTo: input.assignedTo ?? null,
      dueDate: input.dueDate ?? null
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      value: {
        id: result.value.id,
        title: result.value.title,
        status: result.value.status,
        priority: result.value.priority
      }
    };
  }
}
