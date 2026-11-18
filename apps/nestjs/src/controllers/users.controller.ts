import { CreateUseCase } from '@hexafy/example-domain/application';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

interface CreateResponse {
  success: true;
  data: {
    user: { id: string; email: string; name: string | null };
    token: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() input: { name: string; email: string; password: string }
  ): Promise<CreateResponse> {
    const result = await this.createUserUseCase.execute({
      email: input.email,
      password: input.password,
      name: input.name
    });

    if (!result.success) {
      throw result.error;
    }

    return {
      success: true,
      data: result.value
    };
  }
}
