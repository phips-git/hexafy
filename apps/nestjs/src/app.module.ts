import { Module } from '@nestjs/common';

import { HelloController } from './controllers/hello.controller';
import { UsersController } from './controllers/users.controller';
import { CompleteTaskUseCase } from './domain/use-cases/complete-task.use-case';
import { CreateProjectUseCase } from './domain/use-cases/create-project.use-case';
import { CreateTaskUseCase } from './domain/use-cases/create-task.use-case';
import { CreateUserUseCase } from './domain/use-cases/create-user.use-case';
import { ListTasksUseCase } from './domain/use-cases/list-tasks.use-case';
import { SayHelloUseCase } from './domain/use-cases/say-hello.use-case';
import { ProjectsController } from './projects/projects.controller';
import { TasksController } from './tasks/tasks.controller';

@Module({
  controllers: [
    HelloController,
    UsersController,
    ProjectsController,
    TasksController
  ],
  providers: [
    SayHelloUseCase,
    CreateUserUseCase,
    CreateProjectUseCase,
    CreateTaskUseCase,
    CompleteTaskUseCase,
    ListTasksUseCase
  ]
})
export class AppModule {}
