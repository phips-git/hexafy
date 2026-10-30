import {
  createUsecaseProvider,
  DomainExceptionFilter,
  DomainModule,
  UseCaseFilter
} from '@hexafy/nestjs';
import { Module } from '@nestjs/common';

import { HelloController } from './controllers/hello.controller';
import { UsersController } from './controllers/users.controller';
import {
  CreateUserUseCase,
  InMemoryUserRepository
} from './domain/usecases/create-user.usecase';
import { SayHelloUseCase } from './domain/usecases/say-hello.usecase';

@Module({
  imports: [DomainModule],
  controllers: [HelloController, UsersController],
  providers: [
    // Use cases
    createUsecaseProvider(
      new SayHelloUseCase({
        generateId: () => `hello_${Date.now()}`,
        loggerFactory: () => console
      })
    ),
    createUsecaseProvider(new CreateUserUseCase(new InMemoryUserRepository())),

    // Infrastructure
    InMemoryUserRepository,

    // Exception filters - automatically handle domain errors
    {
      provide: 'APP_FILTER',
      useClass: DomainExceptionFilter
    },
    {
      provide: 'APP_FILTER',
      useClass: UseCaseFilter
    }
  ]
})
export class AppModule {}
