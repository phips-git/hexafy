import { Module } from '@nestjs/common';

import { CompleteTaskUseCase } from '../domain/use-cases/complete-task.use-case';
import { CreateTaskUseCase } from '../domain/use-cases/create-task.use-case';
import { ListTasksUseCase } from '../domain/use-cases/list-tasks.use-case';
import { TasksController } from './tasks.controller';

@Module({
  controllers: [TasksController],
  providers: [CreateTaskUseCase, CompleteTaskUseCase, ListTasksUseCase],
  exports: [CreateTaskUseCase, CompleteTaskUseCase, ListTasksUseCase]
})
export class TasksModule {}
