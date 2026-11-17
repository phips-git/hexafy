import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post
} from '@nestjs/common';

import { CompleteTaskUseCase } from '../domain/use-cases/complete-task.use-case';
import { CreateTaskUseCase } from '../domain/use-cases/create-task.use-case';
import { ListTasksUseCase } from '../domain/use-cases/list-tasks.use-case';
import { CreateTaskDto, TaskResponse } from './dtos/task.dto';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly completeTaskUseCase: CompleteTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(@Body() input: CreateTaskDto): Promise<TaskResponse> {
    const result = await this.createTaskUseCase.execute({
      title: input.title,
      description: input.description ?? null,
      projectId: input.projectId,
      priority: input.priority ?? 'medium',
      assignedTo: input.assignedTo ?? null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null
    });

    if (!result.success) {
      throw result.error;
    }

    return {
      id: result.value.id,
      title: result.value.title,
      status: result.value.status,
      priority: result.value.priority,
      createdAt: new Date().toISOString()
    };
  }

  @Post(':taskId/complete')
  @HttpCode(HttpStatus.OK)
  async completeTask(@Param('taskId') taskId: string) {
    const result = await this.completeTaskUseCase.execute({ taskId });

    if (!result.success) {
      throw result.error;
    }

    return {
      id: result.value.id,
      status: result.value.status
    };
  }

  @Get('project/:projectId')
  @HttpCode(HttpStatus.OK)
  async listTasks(@Param('projectId') projectId: string) {
    const result = await this.listTasksUseCase.execute({ projectId });

    if (!result.success) {
      throw result.error;
    }

    return result.value.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority
    }));
  }
}
