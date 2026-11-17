import type { UsecaseResult } from '@hexafy/core/application';
import { CreateUseCase } from '@hexafy/example-domain/application';
import { InMemoryUserRepository } from '@hexafy/example-domain/infrastructure';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface UserCreated {
  id: string;
  email: string;
  name: string | null;
}

export class CreateUserUseCase {
  private readonly delegate: CreateUseCase;

  constructor() {
    this.delegate = new CreateUseCase(new InMemoryUserRepository());
  }

  async execute(input: CreateUserInput): Promise<UsecaseResult<UserCreated>> {
    const result = await this.delegate.execute({
      email: input.email,
      password: input.password,
      name: input.name
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      value: {
        id: result.value.user.id,
        email: result.value.user.email,
        name: result.value.user.name
      }
    };
  }
}
