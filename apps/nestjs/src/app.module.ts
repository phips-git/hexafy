import { Module } from '@nestjs/common';

import { HelloController } from './controllers/hello.controller';
import { UsersController } from './controllers/users.controller';
import { CreateUserUseCase } from './domain/usecases/create-user.usecase';
import { SayHelloUseCase } from './domain/usecases/say-hello.usecase';

@Module({
  controllers: [HelloController, UsersController],
  providers: [SayHelloUseCase, CreateUserUseCase]
})
export class AppModule {}
