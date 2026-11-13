import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';

import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { CreateTaskDto, UpdateTaskDto } from './dtos/create-task.dto';
import { TasksService } from './tasks.service';

interface AuthenticatedUserLike {
  id: string;
  role: string;
}

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Param('projectId') projectId: string,
    @Body() createTaskDto: CreateTaskDto
  ): Promise<{ taskId: string }> {
    return this.tasksService.createTask(createTaskDto, projectId, {
      tenantId: 'demo-tenant',
      projectId,
      role: 'user'
    });
  }

  @Get(':taskId')
  async getTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string
  ): Promise<{ task: unknown }> {
    return { task: await this.tasksService.getTask(projectId, taskId) };
  }

  @Get()
  async listTasks(
    @Param('projectId') projectId: string
  ): Promise<{ tasks: unknown[] }> {
    return { tasks: await this.tasksService.getTasksForProject(projectId) };
  }

  @Put(':taskId')
  async updateTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto
  ): Promise<{ taskId: string }> {
    return this.tasksService.updateTask(taskId, projectId, updateTaskDto, {
      tenantId: 'demo-tenant',
      projectId,
      role: 'user'
    });
  }

  @Delete(':taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string
  ): Promise<void> {
    await this.tasksService.deleteTask(taskId, projectId, {
      tenantId: 'demo-tenant',
      projectId,
      role: 'user'
    });
  }

  private mapUserToAuthContext(user: AuthenticatedUserLike) {
    return {
      tenantId: user.id,
      projectId: '',
      role: user.role
    };
  }
}
