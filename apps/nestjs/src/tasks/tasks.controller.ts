import type { UsecaseResult } from '@hexafy/core/application';
import {
  CompleteTaskUseCase,
  CreateTaskUseCase
} from '@hexafy/example-domain/application';
import type {
  ProjectId,
  Task,
  TaskId,
  UserId
} from '@hexafy/example-domain/domain';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post
} from '@nestjs/common';

interface TaskResponse {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly completeTaskUseCase: CompleteTaskUseCase
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Body()
    input: {
      title: string;
      description?: string | null;
      projectId: string;
      priority?: 'low' | 'medium' | 'high';
      assignedTo?: string | null;
      dueDate?: string | null;
    }
  ): Promise<TaskResponse> {
    const result = (await this.createTaskUseCase.execute({
      projectId: input.projectId as ProjectId,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? 'medium',
      assignedTo: input.assignedTo as UserId,
      dueDate: input.dueDate ? new Date(input.dueDate) : null
    })) as UsecaseResult<Task>;

    if (!result.success) {
      throw result.error;
    }

    return {
      id: result.value.id,
      title: result.value.title,
      status: result.value.status,
      priority: result.value.priority,
      createdAt: result.value.createdAt.toISOString()
    };
  }

  @Post(':taskId/complete')
  @HttpCode(HttpStatus.OK)
  async completeTask(@Param('taskId') taskId: string) {
    const result = (await this.completeTaskUseCase.execute({
      taskId: taskId as TaskId
    })) as UsecaseResult<void>;

    if (!result.success) {
      throw result.error;
    }

    return { success: true };
  }

  @Get('project/:projectId')
  @HttpCode(HttpStatus.OK)
  async listTasks(@Param('projectId') projectId: string) {
    return { projectId };
  }
}
