import { Module } from '@nestjs/common';

import { HelloController } from './controllers/hello.controller';
import { UsersController } from './controllers/users.controller';
import { CreateUserUseCase } from './domain/use-cases/create-user.use-case';
import { SayHelloUseCase } from './domain/use-cases/say-hello.use-case';

@Module({
  controllers: [HelloController, UsersController],
  providers: [SayHelloUseCase, CreateUserUseCase]
})
export class AppModule {}
