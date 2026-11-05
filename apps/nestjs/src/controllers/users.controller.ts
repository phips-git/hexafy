import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import {
  CreateUserInput,
  CreateUserUseCase,
  UserCreated
} from '../domain/usecases/create-user.usecase';

interface CreateResponse {
  success: true;
  data: UserCreated;
}

@Controller('users')
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() input: CreateUserInput): Promise<CreateResponse> {
    const result = await this.createUserUseCase.execute(input);
    if (!result.success) {
      throw result.error;
    }
    return {
      success: true,
      data: result.value
    };
  }
}
