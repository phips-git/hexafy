import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import {
  type CreateUserInput,
  CreateUserUseCase
} from './domain/use-cases/create-user.use-case';

interface CreateResponse {
  success: true;
  data: {
    user: { id: string; email: string; name: string | null };
    token: string;
  };
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
