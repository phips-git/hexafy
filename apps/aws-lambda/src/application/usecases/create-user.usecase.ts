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
  name: string;
  email: string;
  createdAt: Date;
}

export class CreateUserUseCase {
  private readonly delegate: CreateUseCase;

  constructor() {
    this.delegate = new CreateUseCase(new InMemoryUserRepository());
  }

  async execute(input: CreateUserInput): Promise<
    UsecaseResult<{
      user: { id: string; email: string; name: string | null };
      token: string;
    }>
  > {
    return this.delegate.execute({
      email: input.email,
      password: input.password,
      name: input.name
    });
  }
}
