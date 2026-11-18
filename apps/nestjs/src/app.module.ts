import type { UseCaseConfiguration } from '@hexafy/core/application';
import {
  JSONConsoleLoggingAdapter,
  NoOpMetricsAdapter,
  SystemClockAdapter,
  SystemIdentifierAdapter
} from '@hexafy/core/infrastructure';
import {
  AuthenticateUseCase,
  CompleteTaskUseCase,
  CreateProjectUseCase,
  CreateTaskUseCase,
  CreateUseCase,
  SayHelloUseCase
} from '@hexafy/example-domain/application';
import {
  InMemoryAuthenticationAdapter,
  InMemoryProjectRepository,
  InMemoryTaskRepository,
  InMemoryUserRepository
} from '@hexafy/example-domain/infrastructure';
import { Module } from '@nestjs/common';

import { HelloController } from './controllers/hello.controller';
import { UsersController } from './controllers/users.controller';
import { ProjectsController } from './projects/projects.controller';
import { TasksController } from './tasks/tasks.controller';

const DEFAULT_CONFIG: UseCaseConfiguration = {
  logger: JSONConsoleLoggingAdapter('nestjs-example'),
  clock: SystemClockAdapter,
  identifier: SystemIdentifierAdapter,
  metrics: NoOpMetricsAdapter
};

// Use case providers that wrap example-domain use cases
const useCaseProviders = [
  {
    provide: 'CreateUser',
    useFactory: (userRepository: InMemoryUserRepository) =>
      new CreateUseCase(userRepository)
  },
  {
    provide: 'AuthenticateUser',
    useFactory: (authAdapter: InMemoryAuthenticationAdapter) =>
      new AuthenticateUseCase(authAdapter)
  },
  {
    provide: 'CreateProject',
    useFactory: (projectRepository: InMemoryProjectRepository) =>
      new CreateProjectUseCase(projectRepository, DEFAULT_CONFIG)
  },
  {
    provide: 'CreateTask',
    useFactory: (taskRepository: InMemoryTaskRepository) =>
      new CreateTaskUseCase(taskRepository, DEFAULT_CONFIG)
  },
  {
    provide: 'CompleteTask',
    useFactory: (taskRepository: InMemoryTaskRepository) =>
      new CompleteTaskUseCase(taskRepository)
  },
  {
    provide: 'SayHello',
    useFactory: () => new SayHelloUseCase(DEFAULT_CONFIG)
  }
];

@Module({
  controllers: [
    HelloController,
    UsersController,
    ProjectsController,
    TasksController
  ],
  providers: [
    ...useCaseProviders,
    InMemoryAuthenticationAdapter,
    InMemoryProjectRepository,
    InMemoryTaskRepository,
    InMemoryUserRepository
  ],
  exports: [...useCaseProviders]
})
export class AppModule {}
